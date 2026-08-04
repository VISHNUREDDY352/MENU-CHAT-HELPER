export default function Cart({ cart, onRemove }) {
  const total = cart.reduce((s, i) => s + Number(i.price) * i.qty, 0)

  if (cart.length === 0) return (
    <div className="sr-cart d-flex align-items-center">
      <span className="text-secondary small"><i className="bi bi-cart me-1"></i>Your cart is empty — add something delicious!</span>
    </div>
  )

  return (
    <div className="sr-cart d-flex align-items-center flex-wrap gap-2">
      <span className="fw-semibold small" style={{ color: 'var(--main-light)' }}><i className="bi bi-cart me-1"></i>Cart</span>

      {cart.map(item => (
        <span key={item.id} className="sr-cart-chip">
          {item.name}
          {item.qty > 1 && <strong> ×{item.qty}</strong>}
          <button
            className="btn-close btn-close-white ms-1"
            style={{ fontSize: '0.55rem' }}
            onClick={() => onRemove(item.id)}
            aria-label="Remove"
          />
        </span>
      ))}

      <span className="ms-auto fw-bold sr-cart-total">₹{total.toFixed(2)}</span>
    </div>
  )
}
