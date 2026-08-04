import { useState, useEffect } from 'react'
import Cart from './components/Cart'
import MenuGrid from './components/MenuGrid'
import ChatPanel from './components/ChatPanel'

export default function App() {
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart]           = useState([])
  const [suggested, setSuggested] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    fetch('/api/menu/')
      .then(r => r.json())
      .then(data => { setMenuItems(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function addToCart(item) {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id)
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { ...item, qty: 1 }]
    })
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(c => c.id !== id))
  }

  if (loading) return (
    <div className="sr-loading-screen">
      <div className="sr-loading-brand"><i className="bi bi-cup-hot me-2"></i>SpiceRoute</div>
      <div className="sr-spinner" />
    </div>
  )

  return (
    <>
      {/* Navbar */}
      <nav className="sr-nav">
        <div>
          <div className="sr-nav-brand"><i className="bi bi-cup-hot me-2"></i>SpiceRoute</div>
          <div className="sr-nav-sub">Fine Dining Experience</div>
        </div>
      </nav>

      {/* Cart bar */}
      <Cart cart={cart} onRemove={removeFromCart} />

      {/* Menu — grid per style guide spec */}
      <div className="sr-grid-container">
        <MenuGrid items={menuItems} suggested={suggested} onAdd={addToCart} />
      </div>

      {/* Floating AI chat button + popup */}
      <ChatPanel onSuggest={setSuggested} />
    </>
  )
}
