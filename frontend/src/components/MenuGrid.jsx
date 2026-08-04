const FOOD_IMAGES = {
  'samosa':         'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80',
  'spring roll':    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80',
  'paneer tikka':   'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80',
  'chicken tikka':  'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80',
  'soup':           'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80',
  'butter chicken': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80',
  'biryani':        'https://images.unsplash.com/photo-1563379091339-03246963d5b0?w=400&q=80',
  'dal makhani':    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80',
  'paneer':         'https://images.unsplash.com/photo-1631452180539-96aca7d48617?w=400&q=80',
  'naan':           'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80',
  'pasta':          'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&q=80',
  'pizza':          'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
  'burger':         'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
  'fish':           'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80',
  'rice':           'https://images.unsplash.com/photo-1536304993881-ff86e0c9e09e?w=400&q=80',
  'gulab jamun':    'https://images.unsplash.com/photo-1666711032941-3b498e4ff1c5?w=400&q=80',
  'ice cream':      'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&q=80',
  'kulfi':          'https://images.unsplash.com/photo-1624454002429-636f1c3e3626?w=400&q=80',
  'cheesecake':     'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80',
  'cake':           'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80',
  'brownie':        'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80',
  'kheer':          'https://images.unsplash.com/photo-1666711032941-3b498e4ff1c5?w=400&q=80',
  'lassi':          'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80',
  'chai':           'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
  'coffee':         'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
  'juice':          'https://images.unsplash.com/photo-1534353473418-4cfa0a7d0459?w=400&q=80',
  'lemonade':       'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80',
  'mocktail':       'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80',
  'milkshake':      'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80',
}

const CATEGORY_FALLBACK = {
  starter: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=400&q=80',
  main:    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
  dessert: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80',
  drink:   'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80',
}

function getImage(item) {
  if (item.image_url) return item.image_url
  const nameLower = item.name.toLowerCase()
  for (const [key, url] of Object.entries(FOOD_IMAGES)) {
    if (nameLower.includes(key)) return url
  }
  return CATEGORY_FALLBACK[item.category] || CATEGORY_FALLBACK.main
}

const CATEGORY_ORDER = ['starter', 'main', 'dessert', 'drink']
const CATEGORY_LABEL = {
  starter: '🥗 Starters',
  main:    '🍛 Main Course',
  dessert: '🍮 Desserts',
  drink:   '🥤 Drinks',
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

                      <img
                        src={getImage(item)}
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
                          <span className={`badge rounded-pill ${item.is_veg ? 'text-bg-success' : 'text-bg-danger'}`}
                            style={{ fontSize: '0.68rem' }}>
                            {item.is_veg ? '🌿 Veg' : '🍗 Non-veg'}
                          </span>
                          {item.is_spicy && (
                            <span className="badge rounded-pill text-bg-warning" style={{ fontSize: '0.68rem' }}>
                              🌶 Spicy
                            </span>
                          )}
                        </div>

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
