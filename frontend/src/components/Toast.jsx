import { useState, useCallback } from 'react'

// ── Toast context hook ──
// Usage: const { toasts, addToast } = useToast()
export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ message, type = 'success', icon = null }) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, icon }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}

// ── Toast container ──
export default function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null

  return (
    <div className="sr-toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`sr-toast sr-toast-${t.type}`}>
          {t.icon && <i className={`bi ${t.icon} me-2`}></i>}
          <span className="sr-label">{t.message}</span>
          <button
            className="sr-toast-close"
            onClick={() => onRemove(t.id)}
            aria-label="Dismiss"
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
      ))}
    </div>
  )
}
