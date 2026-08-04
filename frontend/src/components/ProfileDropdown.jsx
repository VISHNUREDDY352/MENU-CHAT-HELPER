import { useState, useRef, useEffect } from 'react'

function getInitials(user) {
  if (user.name) {
    return user.name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }
  if (user.phone) return user.phone.slice(-2)
  return 'U'
}

export default function ProfileDropdown({ user, onUpdateUser, onLogout, orderHistory }) {
  const [open, setOpen]         = useState(false)
  const [tab, setTab]           = useState('profile')   // 'profile' | 'orders'
  const [editing, setEditing]   = useState(false)
  const [nameInput, setNameInput] = useState(user.name || '')
  const [nameError, setNameError] = useState('')
  const dropRef = useRef(null)

  // Close when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false)
        setEditing(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Sync name input when user changes
  useEffect(() => {
    setNameInput(user.name || '')
  }, [user.name])

  function saveName() {
    const trimmed = nameInput.trim()
    if (!trimmed) { setNameError('Name cannot be empty.'); return }
    if (trimmed.length < 2) { setNameError('Name must be at least 2 characters.'); return }
    onUpdateUser({ ...user, name: trimmed })
    setEditing(false)
    setNameError('')
  }

  const displayName = user.name || (user.phone ? `+91 ${user.phone}` : user.username)
  const initials    = getInitials(user)

  return (
    <div className="sr-profile-wrap" ref={dropRef}>
      {/* ── Avatar button ── */}
      <button
        className={`sr-profile-btn ${open ? 'active' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Profile"
        aria-expanded={open}
      >
        <span className="sr-profile-avatar">{initials}</span>
        <span className="sr-profile-name d-none d-sm-inline">{displayName}</span>
        <i className={`bi bi-chevron-${open ? 'up' : 'down'} sr-profile-chevron`}></i>
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="sr-profile-dropdown">
          {/* Header with avatar */}
          <div className="sr-profile-header">
            <div className="sr-profile-avatar-lg">{initials}</div>
            <div className="sr-profile-header-info">
              <div className="sr-profile-header-name">{user.name || 'Guest'}</div>
              <div className="sr-profile-header-phone">
                {user.phone ? `+91 ${user.phone}` : user.username}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="sr-profile-tabs">
            <button
              className={`sr-profile-tab ${tab === 'profile' ? 'active' : ''}`}
              onClick={() => setTab('profile')}
            >
              <i className="bi bi-person me-1"></i>Profile
            </button>
            <button
              className={`sr-profile-tab ${tab === 'orders' ? 'active' : ''}`}
              onClick={() => setTab('orders')}
            >
              <i className="bi bi-receipt me-1"></i>Orders
              {orderHistory.length > 0 && (
                <span className="sr-profile-tab-badge">{orderHistory.length}</span>
              )}
            </button>
          </div>

          {/* ── Profile tab ── */}
          {tab === 'profile' && (
            <div className="sr-profile-body">
              <div className="sr-profile-row">
                <span className="sr-profile-row-label">
                  <i className="bi bi-phone me-1"></i>Mobile
                </span>
                <span className="sr-profile-row-value">
                  {user.phone ? `+91 ${user.phone}` : user.username}
                </span>
              </div>

              <div className="sr-profile-row">
                <span className="sr-profile-row-label">
                  <i className="bi bi-person me-1"></i>Name
                </span>
                {editing ? (
                  <div className="sr-profile-edit-wrap">
                    <input
                      className={`sr-profile-input ${nameError ? 'is-error' : ''}`}
                      value={nameInput}
                      onChange={e => { setNameInput(e.target.value); setNameError('') }}
                      onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditing(false) }}
                      placeholder="Enter your name"
                      autoFocus
                      maxLength={40}
                    />
                    {nameError && <div className="sr-profile-edit-error">{nameError}</div>}
                    <div className="d-flex gap-2 mt-2">
                      <button className="sr-profile-save-btn" onClick={saveName}>
                        <i className="bi bi-check-lg me-1"></i>Save
                      </button>
                      <button className="sr-profile-cancel-btn" onClick={() => { setEditing(false); setNameError(''); setNameInput(user.name || '') }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex align-items-center gap-2">
                    <span className="sr-profile-row-value">{user.name || <em style={{ opacity: 0.5 }}>Not set</em>}</span>
                    <button className="sr-profile-edit-btn" onClick={() => setEditing(true)} title="Edit name">
                      <i className="bi bi-pencil"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Orders tab ── */}
          {tab === 'orders' && (
            <div className="sr-profile-body sr-profile-orders">
              {orderHistory.length === 0 ? (
                <div className="sr-profile-empty">
                  <i className="bi bi-bag-x" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
                  <p>No orders yet</p>
                  <p style={{ fontSize: '12px', opacity: 0.5 }}>Your order history will appear here</p>
                </div>
              ) : (
                <ul className="sr-order-list">
                  {orderHistory.map((order, i) => (
                    <li key={i} className="sr-order-item">
                      <div className="sr-order-top">
                        <span className="sr-order-id">Order #{order.id}</span>
                        <span className="sr-order-date">{order.date}</span>
                      </div>
                      <div className="sr-order-items-list">
                        {order.items.map((it, j) => (
                          <span key={j} className="sr-order-pill">{it.name} ×{it.qty}</span>
                        ))}
                      </div>
                      <div className="sr-order-total">₹{order.total.toFixed(0)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ── Footer: logout ── */}
          <div className="sr-profile-footer">
            <button className="sr-profile-logout" onClick={() => { setOpen(false); onLogout() }}>
              <i className="bi bi-box-arrow-right me-2"></i>Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
