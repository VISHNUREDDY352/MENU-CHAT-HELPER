import { useState } from 'react'

export default function Cart({ cart, onRemove }) {
  const [open, setOpen] = useState(false)
  const total = cart.reduce((s, i) => s + Number(i.price) * i.qty, 0)
  const count = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <>
      {/* Cart FAB button */}
      <button
        className="sr-cart-fab"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle cart"
      >
        <i className="bi bi-cart"></i>
        {count > 0 && <span className="sr-cart-badge">{count}</span>}
      </button>

      {/* Cart popup card */}
      {open && (
        <div className="sr-cart-card shadow">
          {/* Header */}
          <div className="sr-cart-card-header">
            <i className="bi bi-cart me-2"></i>
            <span>Your Cart</span>
            {count > 0 && (
              <span className="sr-cart-count-badge">{count} item{count > 1 ? 's' : ''}</span>
            )}
            <button
              className="sr-cart-close"
              onClick={() => setOpen(false)}
              aria-label="Close cart"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* Body */}
          <div className="sr-cart-card-body">
            {cart.length === 0 ? (
              <div className="sr-cart-empty-state">
                <i className="bi bi-cart-x"></i>
                <p className="sr-body-sm mt-2">Your cart is empty</p>
                <p className="sr-body-sm text-muted">Add something delicious!</p>
              </div>
            ) : (
              <ul className="sr-cart-list">
                {cart.map(item => (
                  <li key={item.id} className="sr-cart-item">
                    <div className="sr-cart-item-info">
                      <span className="sr-label">{item.name}</span>
                      {item.qty > 1 && (
                        <span className="sr-cart-qty">×{item.qty}</span>
                      )}
                    </div>
                    <div className="sr-cart-item-right">
                      <span className="sr-cart-item-price">
                        ₹{(Number(item.price) * item.qty).toFixed(0)}
                      </span>
                      <button
                        className="sr-cart-remove"
                        onClick={() => onRemove(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer total */}
          {cart.length > 0 && (
            <div className="sr-cart-card-footer">
              <div className="sr-cart-footer-row">
                <span className="sr-label">Total</span>
                <span className="sr-cart-total-price">₹{total.toFixed(2)}</span>
              </div>
              <button className="btn-sr-md btn-sr-primary w-100 mt-2 justify-content-center">
                <i className="bi bi-bag-check me-2"></i>Place Order
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
