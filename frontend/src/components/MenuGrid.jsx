import { useState } from 'react'

const CATEGORY_ORDER = ['starter', 'main', 'dessert', 'drink']
const CATEGORY_LABEL = {
  starter: { icon: 'bi-egg-fried',  label: 'Starters' },
  main:    { icon: 'bi-bowl-hot',   label: 'Main Course' },
  dessert: { icon: 'bi-ice-cream',  label: 'Desserts' },
  drink:   { icon: 'bi-cup-straw',  label: 'Drinks' },
}

const CATEGORY_FALLBACK = {
  starter: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=400&q=80',
  main:    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
  dessert: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80',
  drink:   'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80',
}

export default function MenuGrid({ items, suggested, onAdd }) {
  const suggestedLower = suggested.map(s => s.toLowerCase().trim())

  // ── Selection tool filters ──
  const [vegOnly,   setVegOnly]   = useState(false)
  const [spicyOnly, setSpicyOnly] = useState(false)

  // ── Breadcrumb active category ──
  const [activecat, setActivecat] = useState('all')

  const visibleCats = activecat === 'all'
    ? CATEGORY_ORDER
    : [activecat]

  return (
    <div className="d-flex flex-column">

      {/* ── Breadcrumb category nav ── */}
      <nav className="sr-breadcrumb-nav" aria-label="Menu categories">
        <ol className="sr-breadcrumb">
          <li className={`sr-breadcrumb-item ${activecat === 'all' ? 'active' : ''}`}>
            <button onClick={() => setActivecat('all')}>All</button>
          </li>
          {CATEGORY_ORDER.map(cat => (
            <li key={cat} className={`sr-breadcrumb-item ${activecat === cat ? 'active' : ''}`}>
              <i className={`bi ${CATEGORY_LABEL[cat].icon} me-1`}></i>
              <button onClick={() => setActivecat(cat)}>{CATEGORY_LABEL[cat].label}</button>
            </li>
          ))}
        </ol>
      </nav>

      {/* ── Selection tools: toggle + checkboxes ── */}
      <div className="sr-filter-bar d-flex align-items-center gap-4 flex-wrap">
        {/* Veg toggle */}
        <label className="sr-toggle-label">
          <span className="sr-label">Veg Only</span>
          <div className="sr-toggle-wrap">
            <input
              type="checkbox"
              className="sr-toggle-input"
              checked={vegOnly}
              onChange={e => setVegOnly(e.target.checked)}
            />
            <span className="sr-toggle-track">
              <span className="sr-toggle-thumb" />
            </span>
          </div>
        </label>

        {/* Spicy checkbox */}
        <label className="sr-checkbox-label">
          <input
            type="checkbox"
            className="sr-checkbox"
            checked={spicyOnly}
            onChange={e => setSpicyOnly(e.target.checked)}
          />
          <span className="sr-label">Spicy</span>
        </label>
      </div>

      {/* ── Menu sections ── */}
      {visibleCats.map(cat => {
        let group = items.filter(i => i.category === cat)
        if (vegOnly)   group = group.filter(i => i.is_veg)
        if (spicyOnly) group = group.filter(i => i.is_spicy)
        if (!group.length) return null

        return (
          <section key={cat} className="sr-category-section">
            <h2 className="sr-category-title">
              <i className={`bi ${CATEGORY_LABEL[cat].icon} me-2`}></i>
              {CATEGORY_LABEL[cat].label}
            </h2>

            <div className="sr-menu-grid">
              {group.map(item => {
                const isHighlighted = suggestedLower.includes(item.name.toLowerCase().trim())

                // Avatar initials from item name
                const initials = item.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

                return (
                  <div key={item.id} className="sr-menu-card-col">
                    <div className={`card h-100 shadow-sm sr-card ${isHighlighted ? 'highlighted' : ''}`}>

                      {isHighlighted && (
                        <div className="sr-ai-badge"><i className="bi bi-stars me-1"></i>AI Pick</div>
                      )}

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

                        {/* Avatar + name row */}
                        <div className="d-flex align-items-center gap-2">
                          <div className="sr-avatar-initials" aria-label={item.name}>
                            {initials}
                          </div>
                          <div className="sr-label-lg">{item.name}</div>
                        </div>

                        {item.description && (
                          <div className="sr-body-sm text-muted sr-card-desc">{item.description}</div>
                        )}

                        {/* Badges */}
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          <span className="badge rounded-pill sr-label-xs" style={{
                            background: item.is_veg ? '#06C270' : '#FF3B3B', color: '#fff'
                          }}>
                            {item.is_veg
                              ? <><i className="bi bi-flower1 me-1"></i>Veg</>
                              : <><i className="bi bi-egg me-1"></i>Non-veg</>}
                          </span>
                          {item.is_spicy && (
                            <span className="badge rounded-pill sr-label-xs" style={{ background: '#FFCC00', color: '#3A3A3C' }}>
                              <i className="bi bi-thermometer-high me-1"></i>Spicy
                            </span>
                          )}
                        </div>

                        {item.calories && (
                          <div className="sr-calories sr-label-sm">
                            <i className="bi bi-fire me-1"></i>{item.calories} kcal
                          </div>
                        )}

                        <div className="d-flex justify-content-between align-items-center mt-auto pt-2">
                          <span className="sr-price sr-h5">₹{Number(item.price).toFixed(0)}</span>
                          <button className="sr-add-btn btn-sr-sm btn-sr-primary" onClick={() => onAdd(item)}>
                            <i className="bi bi-plus"></i>Add
                          </button>
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
