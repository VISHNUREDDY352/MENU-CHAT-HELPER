import { useState, useRef, useEffect } from 'react'

const QUICK_PROMPTS = [
  'Suggest something spicy 🌶',
  'Best veg starter?',
  'Under 200 calories?',
  "What's popular today?",
  'Light meal for me',
]

export default function ChatPanel({ onSuggest }) {
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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

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
        body: JSON.stringify({ message: msg, history: updatedMessages.slice(-10) }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }])
      onSuggest(data.suggested || [])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: 'Sorry, something went wrong. Please try again.', isError: true },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card sr-chat-card sticky-top" style={{ top: '50px' }}>
      {/* Card header */}
      <div className="card-header sr-chat-header">
        <i className="bi bi-robot me-2"></i>
        <span>AI Menu Assistant</span>
        <span className="sr-chat-online-dot ms-auto" title="Online"></span>
      </div>

      {/* Scrollable message list */}
      <div className="card-body sr-chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`sr-msg ${m.role} ${m.isError ? 'error' : ''}`}>
            <div className="sr-msg-bubble" style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="sr-msg bot">
            <div className="sr-typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompt chips */}
      <div className="sr-quick-chips">
        {QUICK_PROMPTS.map(p => (
          <button key={p} className="sr-chip" onClick={() => send(p)} disabled={loading}>
            {p}
          </button>
        ))}
      </div>

      {/* Input + Send */}
      <div className="card-footer sr-chat-input">
        <form onSubmit={e => { e.preventDefault(); send() }} className="d-flex gap-2 w-100">
          <input
            className="sr-input flex-grow-1"
            placeholder="Ask for suggestions..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            autoComplete="off"
          />
          <button
            className="btn-sr-sm btn-sr-primary"
            type="submit"
            disabled={loading || !input.trim()}
          >
            <i className="bi bi-send"></i>
          </button>
        </form>
      </div>
    </div>
  )
}
