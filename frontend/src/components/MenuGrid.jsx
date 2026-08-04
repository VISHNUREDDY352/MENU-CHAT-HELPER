import { useState } from 'react'

const CATEGORY_ORDER = ['starter', 'main', 'dessert', 'drink']
const CATEGORY_LABEL = {
  starter: { icon: 'bi-egg-fried',  label: 'Starters',    svg: null },
  main:    { icon: 'bi-fire',        label: 'Main Course', svg: null },
  dessert: { icon: 'bi-cake2',       label: 'Desserts',    svg: null },
  drink:   { icon: 'bi-cup-straw',   label: 'Drinks',      svg: null },
}
const CATEGORY_FALLBACK = {
  starter: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=400&q=80',
  main:    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
  dessert: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80',
  drink:   'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80',
}

export default function MenuGrid({ items, suggested, onAdd, cart, onRemove }) {
  // suggested is now an array of item IDs (integers)
  const suggestedSet = new Set(suggested)
  // quick lookup: item id → qty in cart
  const cartMap = Object.fromEntries((cart || []).map(c => [c.id, c.qty]))

  const [vegOnly,    setVegOnly]    = useState(false)
  const [nonVegOnly, setNonVegOnly] = useState(false)
  const [spicyOnly,  setSpicyOnly]  = useState(false)
  const [activeCat,  setActiveCat]  = useState('all')

  const visibleCats = activeCat === 'all' ? CATEGORY_ORDER : [activeCat]

  return (
    <div>
      {/* ── Breadcrumb category nav ── */}
      <nav className="sr-breadcrumb-nav" aria-label="Menu categories">
        <ol className="sr-breadcrumb">
          <li className={`sr-breadcrumb-item ${activeCat === 'all' ? 'active' : ''}`}>
            <button onClick={() => setActiveCat('all')}>All</button>
          </li>
          {CATEGORY_ORDER.map(cat => (
            <li key={cat} className={`sr-breadcrumb-item ${activeCat === cat ? 'active' : ''}`}>
              <i className={`bi ${CATEGORY_LABEL[cat].icon} me-1`}></i>
              <button onClick={() => setActiveCat(cat)}>{CATEGORY_LABEL[cat].label}</button>
            </li>
          ))}
        </ol>
      </nav>

      {/* ── Filters ── */}
      <div className="sr-filter-bar d-flex align-items-center gap-4 flex-wrap mb-3">
        <label className="sr-toggle-label">
          <span className="sr-label">Veg Only</span>
          <div className="sr-toggle-wrap">
            <input type="checkbox" className="sr-toggle-input" checked={vegOnly} onChange={e => { setVegOnly(e.target.checked); if (e.target.checked) setNonVegOnly(false) }} />
            <span className="sr-toggle-track"><span className="sr-toggle-thumb" /></span>
          </div>
        </label>
        <label className="sr-toggle-label">
          <span className="sr-label">Non-Veg</span>
          <div className="sr-toggle-wrap">
            <input type="checkbox" className="sr-toggle-input" checked={nonVegOnly} onChange={e => { setNonVegOnly(e.target.checked); if (e.target.checked) setVegOnly(false) }} />
            <span className="sr-toggle-track"><span className="sr-toggle-thumb" /></span>
          </div>
        </label>
        <label className="sr-toggle-label">
          <span className="sr-label">Spicy</span>
          <div className="sr-toggle-wrap">
            <input type="checkbox" className="sr-toggle-input" checked={spicyOnly} onChange={e => setSpicyOnly(e.target.checked)} />
            <span className="sr-toggle-track"><span className="sr-toggle-thumb" /></span>
          </div>
        </label>
      </div>

      {/* ── Menu sections ── */}
      {visibleCats.map(cat => {
        let group = items.filter(i => i.category === cat)
        if (vegOnly)    group = group.filter(i => i.is_veg)
        if (nonVegOnly) group = group.filter(i => !i.is_veg)
        if (spicyOnly)  group = group.filter(i => i.is_spicy)
        if (!group.length) return null

        return (
          <section key={cat} className="sr-category-section">
            <h2 className="sr-category-title">
              <i className={`bi ${CATEGORY_LABEL[cat].icon} me-2`}></i>
              {CATEGORY_LABEL[cat].label}
            </h2>

            {/* Bootstrap grid: 3 cols desktop, 2 tablet, 1 mobile */}
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
              {group.map(item => {
                const isHighlighted = suggestedSet.has(item.id)
                return (
                  <div key={item.id} className="col">
                    <div className={`card h-100 sr-card ${isHighlighted ? 'highlighted' : ''}`}>

                      {isHighlighted && (
                        <div className="sr-ai-badge"><i className="bi bi-stars me-1"></i>AI Pick</div>
                      )}

                      <img
                        src={item.image_url || CATEGORY_FALLBACK[item.category]}
                        className="card-img-top sr-card-img"
                        alt={item.name}
                        loading="lazy"
                        onError={e => { e.target.onerror = null; e.target.src = CATEGORY_FALLBACK[item.category] }}
                      />

                      <div className="card-body d-flex flex-column p-3">
                        <h6 className="card-title sr-label-lg mb-1">{item.name}</h6>

                        {item.description && (
                          <p className="card-text sr-body-sm text-muted sr-card-desc mb-2">{item.description}</p>
                        )}

                        {/* Badges */}
                        <div className="d-flex flex-wrap gap-1 mb-2">
                          <span className="badge rounded-pill sr-label-xs" style={{
                            background: item.is_veg ? 'var(--success)' : 'var(--error)', color: '#fff'
                          }}>
                            <i className={`bi ${item.is_veg ? 'bi-flower1' : 'bi-egg'} me-1`}></i>
                            {item.is_veg ? 'Veg' : 'Non-veg'}
                          </span>
                          {item.is_spicy && (
                            <span className="badge rounded-pill sr-label-xs" style={{ background: 'var(--warning)', color: 'var(--dark-1)' }}>
                              <i className="bi bi-thermometer-high me-1"></i>Spicy
                            </span>
                          )}
                          {item.calories && (
                            <span className="badge rounded-pill sr-label-xs" style={{ background: 'var(--light-2)', color: 'var(--dark-2)' }}>
                              <i className="bi bi-fire me-1"></i>{item.calories} kcal
                            </span>
                          )}
                        </div>

                        {/* Price + Add / Qty controls */}
                        <div className="d-flex justify-content-between align-items-center mt-auto">
                          <span className="sr-price fw-bold">₹{Number(item.price).toFixed(0)}</span>
                          {cartMap[item.id] ? (
                            <div className="sr-qty-control">
                              <button
                                className="sr-qty-btn"
                                onClick={() => onRemove(item.id)}
                                aria-label="Remove one"
                              >
                                <i className="bi bi-dash"></i>
                              </button>
                              <span className="sr-qty-count">{cartMap[item.id]}</span>
                              <button
                                className="sr-qty-btn"
                                onClick={() => onAdd(item)}
                                aria-label="Add one more"
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn-sr-sm btn-sr-primary"
                              onClick={() => onAdd(item)}
                            >
                              <i className="bi bi-plus"></i>Add to cart
                            </button>
                          )}
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
