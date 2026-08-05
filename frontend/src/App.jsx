import { useState, useEffect, useRef } from 'react'
import Cart from './components/Cart'
import MenuGrid from './components/MenuGrid'
import ChatPanel from './components/ChatPanel'
import ToastContainer, { useToast } from './components/Toast'
import Login from './components/Login'
import ProfileDropdown from './components/ProfileDropdown'

function loadCart() {
  try { return JSON.parse(localStorage.getItem('sr_cart')) || [] }
  catch { return [] }
}
function saveCart(cart) {
  localStorage.setItem('sr_cart', JSON.stringify(cart))
}
function loadTheme() {
  return localStorage.getItem('sr_theme') || 'light'
}
function loadUser() {
  try { return JSON.parse(sessionStorage.getItem('sr_user')) || null }
  catch { return null }
}
function loadOrders() {
  try { return JSON.parse(localStorage.getItem('sr_orders')) || [] }
  catch { return [] }
}

let orderCounter = loadOrders().length + 1

// ── Order Confirmation Modal ─────────────────────────────────
function OrderConfirmModal({ order, onClose }) {
  const timerRef = useRef(null)

  // Auto-close after 6 seconds
  useEffect(() => {
    timerRef.current = setTimeout(onClose, 6000)
    return () => clearTimeout(timerRef.current)
  }, [onClose])

  return (
    <div className="sr-confirm-backdrop" onClick={onClose}>
      <div className="sr-confirm-card" onClick={e => e.stopPropagation()}>
        {/* Animated checkmark */}
        <div className="sr-confirm-icon">
          <i className="bi bi-check-circle-fill"></i>
        </div>

        <h3 className="sr-confirm-title">Order Confirmed! 🎉</h3>
        <p className="sr-confirm-sub">
          Your order <strong>#{order.id}</strong> has been placed successfully.
        </p>

        <div className="sr-confirm-delivery">
          <i className="bi bi-clock me-2"></i>
          Estimated delivery: <strong>30 minutes</strong>
        </div>

        <div className="sr-confirm-items">
          {order.items.map((it, i) => (
            <span key={i} className="sr-confirm-pill">
              {it.name} ×{it.qty}
            </span>
          ))}
        </div>

        <div className="sr-confirm-total">
          Total paid: <strong>₹{Number(order.total).toFixed(0)}</strong>
        </div>

        <button className="sr-confirm-btn" onClick={onClose}>
          <i className="bi bi-arrow-right me-2"></i>Continue Browsing
        </button>

        {/* Progress bar auto-close */}
        <div className="sr-confirm-progress">
          <div className="sr-confirm-progress-bar"></div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser]               = useState(loadUser)
  const [menuItems, setMenuItems]     = useState([])
  const [cart, setCart]               = useState(loadCart)
  const [suggested, setSuggested]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [showCart, setShowCart]       = useState(false)
  const [theme, setTheme]             = useState(loadTheme)
  const [search, setSearch]           = useState('')
  const [orderHistory, setOrderHistory] = useState(loadOrders)
  const [orderConfirm, setOrderConfirm] = useState(null)
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('sr_theme', theme)
  }, [theme])

  useEffect(() => {
    if (!user) return
    fetch('/api/menu/')
      .then(r => r.json())
      .then(data => { setMenuItems(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user])

  function handleLogin(userData) {
    sessionStorage.setItem('sr_user', JSON.stringify(userData))
    setUser(userData)
    setOrderHistory(loadOrders())
  }

  function handleLogout() {
    sessionStorage.removeItem('sr_user')
    setUser(null)
    setCart([])
    setSuggested([])
    setMenuItems([])
    setLoading(true)
  }

  function handleUpdateUser(updated) {
    sessionStorage.setItem('sr_user', JSON.stringify(updated))
    setUser(updated)
    if (updated.id) {
      fetch(`/api/auth/customer/${updated.id}/`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: updated.name }),
      }).catch(() => {})
    }
    addToast({ message: 'Name updated!', type: 'success', icon: 'bi-person-check' })
  }

  function toggleTheme() {
    setTheme(t => t === 'light' ? 'dark' : 'light')
  }

  function addToCart(item) {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id)
      const next = existing
        ? prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
        : [...prev, { ...item, qty: 1 }]
      saveCart(next)
      return next
    })
    addToast({ message: `${item.name} added to cart`, type: 'success', icon: 'bi-cart-check' })
  }

  function removeFromCart(id) {
    const item = cart.find(c => c.id === id)
    setCart(prev => {
      const next = prev.filter(c => c.id !== id)
      saveCart(next)
      return next
    })
    if (item) addToast({ message: `${item.name} removed`, type: 'error', icon: 'bi-trash' })
  }

  function decrementCart(id) {
    const item = cart.find(c => c.id === id)
    if (!item) return
    setCart(prev => {
      const next = item.qty === 1
        ? prev.filter(c => c.id !== id)
        : prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c)
      saveCart(next)
      return next
    })
    addToast({
      message: item.qty === 1 ? `${item.name} removed` : `${item.name} ×${item.qty - 1}`,
      type: item.qty === 1 ? 'error' : 'info',
      icon: item.qty === 1 ? 'bi-trash' : 'bi-dash-circle'
    })
  }

  async function placeOrder() {
    if (cart.length === 0) return
    const total = cart.reduce((s, i) => s + Number(i.price) * i.qty, 0)
    const order = {
      id:    orderCounter++,
      date:  new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      items: cart.map(c => ({ name: c.name, qty: c.qty })),
      total,
    }

    if (user.id) {
      try {
        await fetch('/api/orders/', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            customer_id: user.id,
            total,
            items: cart.map(c => ({ id: c.id, name: c.name, price: c.price, qty: c.qty })),
          }),
        })
      } catch {}
    }

    const updated = [order, ...orderHistory]
    setOrderHistory(updated)
    localStorage.setItem('sr_orders', JSON.stringify(updated))
    setCart([])
    saveCart([])
    setShowCart(false)
    setOrderConfirm(order)   // ← show confirmation modal
  }

  if (!user) return <Login onLogin={handleLogin} />

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
      <div className="sr-fixed-top">
        <nav className="sr-nav navbar navbar-dark">
          <div className="container-fluid">
            <span className="sr-nav-brand" style={{ zIndex: 1 }}>
              <i className="bi bi-cup-hot me-2"></i>
              <span className="d-flex flex-column">
                <span>SpiceRoute</span>
                <span className="sr-nav-sub">Fine Dining Experience</span>
              </span>
            </span>

            <div className="sr-nav-search">
              <i className="bi bi-search sr-nav-search-icon"></i>
              <input
                className="sr-nav-search-input"
                type="search"
                placeholder="Search dishes…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search menu"
              />
              {search && (
                <button className="sr-nav-search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>

            <div className="ms-auto" style={{ zIndex: 1 }}>
              <ProfileDropdown
                user={user}
                onUpdateUser={handleUpdateUser}
                onLogout={handleLogout}
                orderHistory={orderHistory}
              />
            </div>
          </div>
        </nav>
        <Cart
          cart={cart}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onDecrement={decrementCart}
          show={showCart}
          onToggle={() => setShowCart(o => !o)}
          onClose={() => setShowCart(false)}
          itemCount={itemCount}
          total={total}
          theme={theme}
          onToggleTheme={toggleTheme}
          onPlaceOrder={placeOrder}
        />
      </div>

      <div className="sr-body-layout">
        <div className="sr-menu-col">
          <MenuGrid
            items={menuItems}
            suggested={suggested}
            onAdd={addToCart}
            cart={cart}
            onRemove={decrementCart}
            search={search}
          />
        </div>
        <div className="sr-chat-col">
          <ChatPanel onSuggest={setSuggested} />
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ── Order confirmation modal ── */}
      {orderConfirm && (
        <OrderConfirmModal
          order={orderConfirm}
          onClose={() => setOrderConfirm(null)}
        />
      )}
    </>
  )
}
