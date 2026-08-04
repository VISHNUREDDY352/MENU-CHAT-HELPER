import { useState, useRef, useEffect } from 'react'

const BG_VIDEO = '/bg.mp4'

// Generate a random 6-digit OTP
function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

// ── Step 1: Phone number entry ──────────────────────────────
function PhoneStep({ onSendOTP }) {
  const [phone, setPhone]   = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function validate(val) {
    if (!val) return 'Please enter your mobile number.'
    if (!/^[6-9]\d{9}$/.test(val)) return 'Enter a valid 10-digit Indian mobile number.'
    return ''
  }

  function handleSend(e) {
    e.preventDefault()
    const err = validate(phone)
    if (err) { setError(err); return }
    setLoading(true)
    // Simulate network delay then generate OTP
    setTimeout(() => {
      const otp = generateOTP()
      setLoading(false)
      onSendOTP(phone, otp)
    }, 900)
  }

  return (
    <form onSubmit={handleSend} noValidate>
      <h2 className="sr-login-title">Login / Sign up</h2>
      <p className="sr-login-subtitle">Enter your mobile number to continue</p>

      <div className="sr-login-field">
        <label className="sr-login-label">
          <i className="bi bi-phone me-1"></i>Mobile Number
        </label>
        <div className="sr-login-phone-wrap">
          <span className="sr-login-country-code">🇮🇳 +91</span>
          <input
            className={`sr-login-input sr-login-phone-input ${error ? 'is-error' : ''}`}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="Enter 10-digit number"
            value={phone}
            onChange={e => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 10)
              setPhone(v)
              setError('')
            }}
            autoComplete="tel"
            autoFocus
          />
        </div>
        {error && (
          <div className="sr-login-field-error">
            <i className="bi bi-exclamation-circle me-1"></i>{error}
          </div>
        )}
      </div>

      <button type="submit" className="sr-login-btn" disabled={loading}>
        {loading
          ? <><span className="sr-login-spinner"></span>Sending OTP…</>
          : <><i className="bi bi-send me-2"></i>Send OTP</>}
      </button>

      <p className="sr-login-hint">
        <i className="bi bi-shield-lock me-1"></i>
        OTP will be sent via SMS to your number
      </p>
    </form>
  )
}

// ── Step 2: OTP verification ─────────────────────────────────
function OTPStep({ phone, otp, onVerify, onBack }) {
  const [digits, setDigits]     = useState(['', '', '', '', '', ''])
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const [resendLoading, setResendLoading] = useState(false)
  const [newOtp, setNewOtp]     = useState(otp)
  const inputRefs               = useRef([])

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  function handleDigitChange(idx, val) {
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[idx] = v
    setDigits(next)
    setError('')
    // Auto-focus next box
    if (v && idx < 5) inputRefs.current[idx + 1]?.focus()
    // Auto-submit when all 6 filled
    if (v && idx === 5) {
      const code = [...next.slice(0, 5), v].join('')
      if (code.length === 6) verifyCode(code)
    }
  }

  function handleKeyDown(idx, e) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const arr = pasted.split('')
      setDigits(arr)
      inputRefs.current[5]?.focus()
      verifyCode(pasted)
    }
    e.preventDefault()
  }

  function verifyCode(code) {
    if (code !== newOtp) {
      setError('Incorrect OTP. Please try again.')
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onVerify(phone)
    }, 700)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < 6) { setError('Please enter all 6 digits.'); return }
    verifyCode(code)
  }

  function handleResend() {
    setResendLoading(true)
    setTimeout(() => {
      const fresh = generateOTP()
      setNewOtp(fresh)
      setDigits(['', '', '', '', '', ''])
      setError('')
      setResendTimer(30)
      setResendLoading(false)
      inputRefs.current[0]?.focus()
      // In demo: show alert with new OTP
      alert(`[DEMO] Your new OTP is: ${fresh}`)
    }, 800)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <button
        type="button"
        className="sr-login-back"
        onClick={onBack}
      >
        <i className="bi bi-arrow-left me-1"></i>Change number
      </button>

      <h2 className="sr-login-title">Verify OTP</h2>
      <p className="sr-login-subtitle">
        Sent to <strong style={{ color: '#fff' }}>+91 {phone}</strong>
      </p>

      {/* Demo OTP hint */}
      <div className="sr-login-otp-demo-hint">
        <i className="bi bi-info-circle me-1"></i>
        <strong>Demo OTP:</strong>&nbsp;{newOtp}
      </div>

      {/* 6 digit boxes */}
      <div className="sr-otp-row" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => inputRefs.current[i] = el}
            className={`sr-otp-box ${error ? 'is-error' : ''} ${d ? 'filled' : ''}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleDigitChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            autoFocus={i === 0}
            autoComplete="one-time-code"
          />
        ))}
      </div>

      {error && (
        <div className="sr-login-field-error mt-2">
          <i className="bi bi-exclamation-circle me-1"></i>{error}
        </div>
      )}

      <button
        type="submit"
        className="sr-login-btn mt-3"
        disabled={loading || digits.join('').length < 6}
      >
        {loading
          ? <><span className="sr-login-spinner"></span>Verifying…</>
          : <><i className="bi bi-check-circle me-2"></i>Verify & Enter</>}
      </button>

      {/* Resend */}
      <div className="sr-login-resend">
        {resendTimer > 0
          ? <span>Resend OTP in <strong>{resendTimer}s</strong></span>
          : <button
              type="button"
              className="sr-login-resend-btn"
              onClick={handleResend}
              disabled={resendLoading}
            >
              {resendLoading ? 'Sending…' : <><i className="bi bi-arrow-repeat me-1"></i>Resend OTP</>}
            </button>
        }
      </div>
    </form>
  )
}

// ── Main Login component ──────────────────────────────────────
export default function Login({ onLogin }) {
  const [step, setStep]   = useState('phone')   // 'phone' | 'otp'
  const [phone, setPhone] = useState('')
  const [otp, setOtp]     = useState('')

  function handleSendOTP(ph, generatedOtp) {
    setPhone(ph)
    setOtp(generatedOtp)
    setStep('otp')
    // In a real app: call your backend here to trigger SMS
    // For demo: show the OTP in an alert
    alert(`[DEMO] Your OTP for +91 ${ph} is: ${generatedOtp}\n\n(In production this would be sent via SMS)`)
  }

  function handleVerify(ph) {
    onLogin({ phone: ph, username: `+91${ph}` })
  }

  return (
    <div className="sr-login-root">
      {/* Background video */}
      <video
        className="sr-login-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        src={BG_VIDEO}
      />
      {/* Dark overlay */}
      <div className="sr-login-overlay" />

      {/* Content */}
      <div className="sr-login-center">
        <div className="sr-login-brand">
          <i className="bi bi-cup-hot-fill me-2"></i>SpiceRoute
        </div>
        <p className="sr-login-tagline">India's finest dining experience</p>

        <div className="sr-login-card">
          {step === 'phone'
            ? <PhoneStep onSendOTP={handleSendOTP} />
            : <OTPStep
                phone={phone}
                otp={otp}
                onVerify={handleVerify}
                onBack={() => setStep('phone')}
              />
          }
        </div>

        <p className="sr-login-footer">© 2026 SpiceRoute · Fine Dining</p>
      </div>
    </div>
  )
}
