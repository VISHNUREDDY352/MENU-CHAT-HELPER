import { useState, useRef, useEffect } from 'react'

const QUICK_PROMPTS = [
  'Suggest something spicy 🌶',
  'Best veg starter?',
  'Under 200 calories?',
  "What's popular today?",
  'Light meal for me',
]

export default function ChatPanel({ onSuggest }) {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hi! I'm your SpiceRoute assistant. Ask me anything — \"low calorie options\", \"spicy non-veg under ₹300\", or \"best veg starter\".",
    },
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef             = useRef(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, open])

  async function send(text) {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')

    const updatedMessages = [...messages, { role: 'user', text: msg }]
    setMessages(updatedMessages)
    setLoading(true)

    try {
      const res  = await fetch('/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history: updatedMessages.slice(-10), // send last 10 msgs as context
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }])
      onSuggest(data.suggested || [])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    send()
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        className="sr-chat-fab"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle AI Chat Assistant"
        title="AI Menu Assistant"
      >
        🤖
        <span className="sr-chat-fab-label">AI Menu Assistant</span>
        {!open && <span className="sr-chat-fab-dot" />}
      </button>

      {/* Chat popup */}
      {open && (
        <div className="sr-chat-popup shadow">
          {/* Header */}
          <div className="sr-chat-header">
            <span>🤖</span>
            <span>AI Menu Assistant</span>
            <span className="dot" />
            <button
              className="sr-chat-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >✕</button>
          </div>

          {/* Messages */}
          <div className="sr-chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`sr-msg ${m.role}`}>
                <div className="sr-msg-bubble" style={{ whiteSpace: 'pre-wrap' }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="sr-msg bot">
                <div className="sr-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div className="sr-quick-chips">
            {QUICK_PROMPTS.map(p => (
              <button key={p} className="sr-chip" onClick={() => send(p)} disabled={loading}>
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="sr-chat-input">
            <form onSubmit={handleSubmit} className="w-100 d-flex gap-2">
              <input
                className="form-control form-control-sm"
                placeholder="Ask for suggestions..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
                autoComplete="off"
              />
              <button className="sr-send-btn" type="submit" disabled={loading || !input.trim()}>
                Send ↑
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
