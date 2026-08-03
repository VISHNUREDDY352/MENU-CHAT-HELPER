export default function Cart({ cart, onRemove }) {
  const total = cart.reduce((s, i) => s + Number(i.price) * i.qty, 0)

  if (cart.length === 0) return (
    <div className="sr-cart">
      <span className="sr-cart-empty">🛒 Your cart is empty — add something delicious!</span>
    </div>
  )

  return (
    <div className="sr-cart">
      <span className="sr-cart-label">🛒 Cart</span>
      {cart.map(item => (
        <span key={item.id} className="sr-cart-chip">
          {item.name}
          {item.qty > 1 && <strong> ×{item.qty}</strong>}
          <button onClick={() => onRemove(item.id)} title="Remove">✕</button>
        </span>
      ))}
      <span className="sr-cart-total">₹{total.toFixed(2)}</span>
    </div>
  )
}
