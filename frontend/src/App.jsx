import { useState, useEffect } from 'react'
import Cart from './components/Cart'
import MenuGrid from './components/MenuGrid'
import ChatPanel from './components/ChatPanel'
import ToastContainer, { useToast } from './components/Toast'

// Persist cart to localStorage
function loadCart() {
  try { return JSON.parse(localStorage.getItem('sr_cart')) || [] }
  catch { return [] }
}
function saveCart(cart) {
  localStorage.setItem('sr_cart', JSON.stringify(cart))
}

export default function App() {
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart]           = useState(loadCart)
  const [suggested, setSuggested] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showCart, setShowCart]   = useState(false)
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    fetch('/api/menu/')
      .then(r => r.json())
      .then(data => { setMenuItems(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function addToCart(item) {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id)
      const next = existing
        ? prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
        : [...prev, { ...item, qty: 1 }]
      saveCart(next)
      return next
    })
    addToast({
      message: `${item.name} added to cart`,
      type: 'success',
      icon: 'bi-cart-check'
    })
  }

  function removeFromCart(id) {
    const item = cart.find(c => c.id === id)
    setCart(prev => {
      const next = prev.filter(c => c.id !== id)
      saveCart(next)
      return next
    })
    if (item) addToast({
      message: `${item.name} removed`,
      type: 'error',
      icon: 'bi-trash'
    })
  }

  if (loading) return (
    <div className="sr-loading-screen">
      <div className="sr-loading-brand"><i className="bi bi-cup-hot me-2"></i>SpiceRoute</div>
      <div className="sr-spinner" />
    </div>
  )

  const itemCount = cart.reduce((s, i) => s + i.qty, 0)
  const total     = cart.reduce((s, i) => s + Number(i.price) * i.qty, 0)

  return (
    <>
      {/* ── Fixed top: Navbar + Cart bar ── */}
      <div className="sr-fixed-top">
        <nav className="sr-nav navbar navbar-dark">
          <div className="container-fluid">
            <span className="sr-nav-brand"><i className="bi bi-cup-hot me-2"></i>SpiceRoute</span>
            <span className="sr-nav-sub d-none d-md-block">Fine Dining Experience</span>
          </div>
        </nav>
        <Cart
          cart={cart}
          onRemove={removeFromCart}
          show={showCart}
          onToggle={() => setShowCart(o => !o)}
          onClose={() => setShowCart(false)}
          itemCount={itemCount}
          total={total}
        />
      </div>

      {/* ── Body below fixed header ── */}
      <div className="sr-body-layout">
        {/* Left: scrollable menu */}
        <div className="sr-menu-col">
          <MenuGrid items={menuItems} suggested={suggested} onAdd={addToCart} />
        </div>
        {/* Right: fixed chat panel */}
        <div className="sr-chat-col">
          <ChatPanel onSuggest={setSuggested} />
        </div>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
