export default function Cart({ cart, onAdd, onRemove, onDecrement, show, onToggle, onClose, itemCount, total, theme, onToggleTheme, onPlaceOrder }) {
  return (
    <>
      {/* ── Section 1: Sticky cart bar ── */}
      <div className="sr-cartbar">
        <div className="container-fluid d-flex align-items-center gap-3" style={{ maxWidth: '100%', padding: '0 16px' }}>
          <i className="bi bi-cart-fill me-1"></i>
          <span className="sr-label">
            Cart: <strong>{itemCount} item{itemCount !== 1 ? 's' : ''}</strong>
          </span>
          <span className="sr-cartbar-sep">·</span>
          <span className="sr-label">Total <strong>₹{total.toFixed(0)}</strong></span>

          <div className="d-flex align-items-center gap-2 ms-auto">
            <button className="btn-sr-sm btn-sr-secondary" onClick={onToggle}>
              <i className="bi bi-cart me-1"></i>View Cart
              {itemCount > 0 && (
                <span className="ms-2 badge rounded-pill" style={{ background: 'var(--main)', color: '#fff', fontSize: '11px' }}>
                  {itemCount}
                </span>
              )}
            </button>
            <button
              className="sr-theme-toggle-icon"
              onClick={onToggleTheme}
              title={theme === 'light' ? 'Switch to Dark mode' : 'Switch to Light mode'}
              aria-label="Toggle theme"
            >
              <i className={`bi ${theme === 'light' ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* ── Offcanvas — cart detail ── */}
      {show && (
        <div className="offcanvas offcanvas-end show" tabIndex="-1" style={{ visibility: 'visible', width: '360px' }}>
          <div className="offcanvas-header sr-offcanvas-header">
            <h5 className="offcanvas-title sr-h5">
              <i className="bi bi-cart me-2"></i>Your Cart
              {itemCount > 0 && (
                <span className="badge ms-2" style={{ background: 'var(--main)', fontSize: '12px' }}>
                  {itemCount}
                </span>
              )}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close" />
          </div>

          <div className="offcanvas-body p-0">
            {cart.length === 0 ? (
              <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted" style={{ minHeight: '200px' }}>
                <i className="bi bi-cart-x" style={{ fontSize: '2.5rem', color: 'var(--dark-4)' }}></i>
                <p className="sr-body-sm mt-3">Your cart is empty</p>
                <p className="sr-body-sm">Add something delicious!</p>
              </div>
            ) : (
              <ul className="list-group list-group-flush">
                {cart.map(item => (
                  <li key={item.id} className="sr-cart-offcanvas-item">
                    {/* Item image */}
                    <img
                      src={item.image_url || ''}
                      alt={item.name}
                      className="sr-offcanvas-img"
                      onError={e => { e.target.style.display = 'none' }}
                    />

                    {/* Name + price per unit */}
                    <div className="sr-cart-offcanvas-info">
                      <div className="sr-label text-truncate">{item.name}</div>
                      <div className="sr-body-sm" style={{ color: 'var(--text-muted)' }}>
                        ₹{Number(item.price).toFixed(0)} each
                      </div>
                    </div>

                    {/* − qty + pill */}
                    <div className="sr-qty-control">
                      <button
                        className="sr-qty-btn"
                        onClick={() => onDecrement(item.id)}
                        aria-label="Remove one"
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                      <span className="sr-qty-count">{item.qty}</span>
                      <button
                        className="sr-qty-btn"
                        onClick={() => onAdd(item)}
                        aria-label="Add one more"
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>

                    {/* Line total */}
                    <span className="sr-cart-offcanvas-total">
                      ₹{(Number(item.price) * item.qty).toFixed(0)}
                    </span>

                    {/* Trash — removes all qty */}
                    <button
                      className="sr-cart-offcanvas-trash"
                      onClick={() => onRemove(item.id)}
                      aria-label={`Remove ${item.name}`}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {cart.length > 0 && (
            <div className="sr-offcanvas-footer">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="sr-label-lg">Total</span>
                <span className="sr-h5" style={{ color: 'var(--main)' }}>
                  ₹{cart.reduce((s, i) => s + Number(i.price) * i.qty, 0).toFixed(2)}
                </span>
              </div>
              <button className="btn-sr-lg btn-sr-primary w-100 justify-content-center" onClick={onPlaceOrder}>
                <i className="bi bi-bag-check me-2"></i>Place Order
              </button>
            </div>
          )}
        </div>
      )}

      {show && <div className="offcanvas-backdrop fade show" onClick={onClose} />}
    </>
  )
}
