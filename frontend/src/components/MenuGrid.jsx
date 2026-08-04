const CATEGORY_ORDER = ['starter', 'main', 'dessert', 'drink']
const CATEGORY_LABEL = {
  starter: '🥗 Starters',
  main:    '🍛 Main Course',
  dessert: '🍮 Desserts',
  drink:   '🥤 Drinks',
}

// Generic fallback per category if DB image_url is missing or broken
const CATEGORY_FALLBACK = {
  starter: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=400&q=80',
  main:    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
  dessert: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80',
  drink:   'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80',
}

export default function MenuGrid({ items, suggested, onAdd }) {
  const suggestedLower = suggested.map(s => s.toLowerCase().trim())

  return (
    <div className="d-flex flex-column gap-4">
      {CATEGORY_ORDER.map(cat => {
        const group = items.filter(i => i.category === cat)
        if (!group.length) return null
        return (
          <section key={cat}>
            <h2 className="sr-category-title">{CATEGORY_LABEL[cat]}</h2>
            <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-3">
              {group.map(item => {
                const isHighlighted = suggestedLower.includes(item.name.toLowerCase().trim())
                return (
                  <div key={item.id} className="col">
                    <div className={`card h-100 shadow-sm sr-card ${isHighlighted ? 'highlighted' : ''}`}>

                      {isHighlighted && (
                        <div className="sr-ai-badge">✨ AI Pick</div>
                      )}

                      {/* Use image_url from DB directly */}
                      <img
                        src={item.image_url || CATEGORY_FALLBACK[item.category] || CATEGORY_FALLBACK.main}
                        className="sr-card-img"
                        alt={item.name}
                        loading="lazy"
                        onError={e => {
                          e.target.onerror = null
                          e.target.src = CATEGORY_FALLBACK[item.category] || CATEGORY_FALLBACK.main
                        }}
                      />

                      <div className="card-body d-flex flex-column gap-1 p-2">
                        <div className="fw-semibold" style={{ fontSize: '0.95rem' }}>{item.name}</div>

                        {item.description && (
                          <div className="text-muted sr-card-desc">{item.description}</div>
                        )}

                        <div className="d-flex flex-wrap gap-1 mt-1">
                          <span className="badge rounded-pill" style={{
                            fontSize: '0.68rem',
                            background: item.is_veg ? '#06C270' : '#FF3B3B',
                            color: '#fff'
                          }}>
                            {item.is_veg ? '🌿 Veg' : '🍗 Non-veg'}
                          </span>
                          {item.is_spicy && (
                            <span className="badge rounded-pill" style={{ fontSize: '0.68rem', background: '#FFCC00', color: '#1A3A3C' }}>
                              🌶 Spicy
                            </span>
                          )}
                        </div>

                        {item.calories && (
                          <div className="sr-calories">🔥 {item.calories} kcal</div>
                        )}

                        <div className="d-flex justify-content-between align-items-center mt-auto pt-2">
                          <span className="sr-price">₹{Number(item.price).toFixed(0)}</span>
                          <button className="sr-add-btn" onClick={() => onAdd(item)}>+ Add</button>
                        </div>
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
