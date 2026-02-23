import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPassword } from '../../api/auth'
import './ForgotPasswordPage.css'

const RESEND_STORAGE_PREFIX = 'resetPasswordResend_'
const PENDING_EMAIL_KEY = 'forgotPasswordPendingEmail'
const PENDING_STATE_KEY = 'forgotPasswordPendingState'
const COOLDOWN_SEC = 60

const PENDING_SEND = 'pending_send'

function getResendStorageKey(email: string): string {
  return RESEND_STORAGE_PREFIX + email
}

function formatCooldown(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function saveCooldownEnd(email: string): void {
  try {
    sessionStorage.setItem(getResendStorageKey(email), String(Date.now() + COOLDOWN_SEC * 1000))
  } catch { }
}

function loadCooldownRemaining(email: string): number {
  try {
    const stored = sessionStorage.getItem(getResendStorageKey(email))
    const endTime = stored ? parseInt(stored, 10) : 0
    const now = Date.now()
    if (endTime > now) return Math.ceil((endTime - now) / 1000)
    return 0
  } catch {
    return 0
  }
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(() => {
    try {
      const pending = sessionStorage.getItem(PENDING_EMAIL_KEY)
      const state = sessionStorage.getItem(PENDING_STATE_KEY)
      if (!pending || state !== PENDING_SEND) return null
      const remaining = loadCooldownRemaining(pending)
      return remaining > 0 ? pending : null
    } catch {
      return null
    }
  })
  const [cooldownRemaining, setCooldownRemaining] = useState(() => {
    if (typeof window === 'undefined') return 0
    try {
      const pending = sessionStorage.getItem(PENDING_EMAIL_KEY)
      if (!pending || sessionStorage.getItem(PENDING_STATE_KEY) !== PENDING_SEND) return 0
      return loadCooldownRemaining(pending)
    } catch {
      return 0
    }
  })
  const [sendingAfterTimer, setSendingAfterTimer] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!submittedEmail) return
    try {
      sessionStorage.setItem(PENDING_EMAIL_KEY, submittedEmail)
      sessionStorage.setItem(PENDING_STATE_KEY, PENDING_SEND)
    } catch { }
    setCooldownRemaining(loadCooldownRemaining(submittedEmail))
  }, [submittedEmail])

  useEffect(() => {
    if (!submittedEmail || cooldownRemaining <= 0) return
    const id = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          setSendingAfterTimer(true)
          forgotPassword(submittedEmail)
            .then(() => {
              saveCooldownEnd(submittedEmail)
              try {
                sessionStorage.removeItem(PENDING_EMAIL_KEY)
                sessionStorage.removeItem(PENDING_STATE_KEY)
              } catch { }
              navigate('/reset-password', { state: { email: submittedEmail } })
            })
            .catch(() => {
              setSendingAfterTimer(false)
              setError('Не удалось отправить код')
              setSubmittedEmail(null)
            })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [submittedEmail, cooldownRemaining, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const remaining = loadCooldownRemaining(email)
    if (remaining > 0) {
      setSubmittedEmail(email)
      setCooldownRemaining(remaining)
      return
    }
    setLoading(true)
    try {
      await forgotPassword(email)
      saveCooldownEnd(email)
      navigate('/reset-password', { state: { email } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  if (submittedEmail && cooldownRemaining > 0) {
    return (
      <section className="page auth-page">
        <div className="auth-box">
          <h1>Восстановление пароля</h1>
          <div className="card auth-card">
            <p className="muted">Код будет отправлен на {submittedEmail} после истечения таймера.</p>
            <p className="forgot-timer-hint">
              Отправка кода через <strong>{formatCooldown(cooldownRemaining)}</strong>
            </p>
            {sendingAfterTimer && <p className="muted">Отправка...</p>}
            <p style={{ marginTop: '1rem' }}>
              <Link to="/login">Вернуться к входу</Link>
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page auth-page">
      <div className="auth-box">
        <h1>Восстановление пароля</h1>
        <div className="card auth-card">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="forgot-email">Email</label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <p className="muted auth-email-hint">
              Укажите email, привязанный к аккаунту. На него придёт код для сброса пароля.
            </p>
            <p className="muted auth-email-hint" style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>
              Код действителен 15 минут.
            </p>
            {error && <p className="error">{error}</p>}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Отправка...' : 'Отправить код'}
              </button>
            </div>
            <p style={{ marginTop: '1rem' }}>
              <Link to="/login">Вернуться к входу</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
