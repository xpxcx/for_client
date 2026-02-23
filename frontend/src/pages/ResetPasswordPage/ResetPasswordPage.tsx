import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { resetPassword, forgotPassword } from '../../api/auth'
import './ResetPasswordPage.css'

const RESEND_COOLDOWN_SEC = 60
const RESEND_STORAGE_PREFIX = 'resetPasswordResend_'

function getResendStorageKey(email: string): string {
  return RESEND_STORAGE_PREFIX + email
}

function formatCooldown(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function loadResendCooldown(email: string): number {
  try {
    const key = getResendStorageKey(email)
    const stored = sessionStorage.getItem(key)
    const endTime = stored ? parseInt(stored, 10) : 0
    const now = Date.now()
    if (endTime > now) return Math.ceil((endTime - now) / 1000)
    if (!stored) {
      sessionStorage.setItem(key, String(now + RESEND_COOLDOWN_SEC * 1000))
      return RESEND_COOLDOWN_SEC
    }
    return 0
  } catch {
    return RESEND_COOLDOWN_SEC
  }
}

function saveResendCooldownEnd(email: string): void {
  try {
    sessionStorage.setItem(getResendStorageKey(email), String(Date.now() + RESEND_COOLDOWN_SEC * 1000))
  } catch { }
}

export default function ResetPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const emailFromState = (location.state as { email?: string } | null)?.email ?? ''
  const [step, setStep] = useState<'code' | 'password'>('code')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendLoading, setResendLoading] = useState(false)

  useEffect(() => {
    if (emailFromState) {
      setEmail(emailFromState)
      setResendCooldown(loadResendCooldown(emailFromState))
    }
  }, [emailFromState])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const id = setInterval(() => setResendCooldown((prev) => (prev <= 0 ? 0 : prev - 1)), 1000)
    return () => clearInterval(id)
  }, [resendCooldown])

  const handleResendCode = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (resendCooldown > 0 || resendLoading) return
    setError(null)
    setResendLoading(true)
    try {
      await forgotPassword(email)
      saveResendCooldownEnd(email)
      setResendCooldown(RESEND_COOLDOWN_SEC)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить код')
    } finally {
      setResendLoading(false)
    }
  }

  if (!emailFromState) {
    return <Navigate to="/forgot-password" replace />
  }

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (code.length !== 6) {
      setError('Введите 6 цифр кода')
      return
    }
    setStep('password')
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }
    if (newPassword.length < 6) {
      setError('Пароль должен быть не короче 6 символов')
      return
    }
    setLoading(true)
    try {
      await resetPassword(email, code, newPassword)
      navigate('/login', { replace: true, state: { message: 'Пароль успешно изменён. Войдите с новым паролем.' } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сброса пароля')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'code') {
    return (
      <section className="page auth-page">
        <div className="auth-box">
          <h1>Сброс пароля</h1>
          <div className="card auth-card">
            <form className="contact-form" onSubmit={handleCodeSubmit}>
              {!emailFromState && (
                <div className="form-group">
                  <label htmlFor="reset-email">Email</label>
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label htmlFor="reset-code">Код из письма</label>
                <input
                  id="reset-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  required
                  maxLength={6}
                />
              </div>
              {error && <p className="error">{error}</p>}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Продолжить
                </button>
              </div>
              {resendCooldown > 0 && (
                <p className="resend-code-hint muted">
                  Получить новый код можно через {formatCooldown(resendCooldown)}
                </p>
              )}
              <p className="resend-code-row">
                <button
                  type="button"
                  className={`btn btn-resend ${resendCooldown > 0 ? 'btn-resend-disabled' : ''}`}
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || resendLoading}
                >
                  {resendLoading
                    ? 'Отправка...'
                    : resendCooldown > 0
                      ? `Отправить код ещё раз (${formatCooldown(resendCooldown)})`
                      : 'Отправить код ещё раз'}
                </button>
              </p>
              <p style={{ marginTop: '1rem' }}>
                <Link to="/login">Вернуться к входу</Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page auth-page">
      <div className="auth-box">
        <h1>Сброс пароля</h1>
        <div className="card auth-card">
          <form className="contact-form" onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="reset-new-password">Новый пароль</label>
              <div className="password-field">
                <input
                  id="reset-new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  autoFocus
                />
                {newPassword.length > 0 && (
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                    title={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  >
                    {showPassword ? 'Скрыть' : 'Показать'}
                  </button>
                )}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="reset-confirm-password">Повторите пароль</label>
              <input
                id="reset-confirm-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {error && <p className="error">{error}</p>}
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setStep('code')} disabled={loading}>
                Назад
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить'}
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
