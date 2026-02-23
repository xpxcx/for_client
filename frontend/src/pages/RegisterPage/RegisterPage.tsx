import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { sendRegisterCode, registerVerify, setToken } from '../../api/auth'
import './RegisterPage.css'

export default function RegisterPage() {
  const [step, setStep] = useState<'email' | 'verify'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleConfirmEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await sendRegisterCode(email)
      setStep('verify')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки кода')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { access_token } = await registerVerify(email, code, password)
      setToken(access_token)
      navigate('/cabinet', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'email') {
    return (
      <section className="page auth-page">
        <div className="auth-box">
          <h1>Регистрация</h1>
          <div className="card auth-card">
            <form className="contact-form" onSubmit={handleConfirmEmail}>
              <div className="form-group">
                <label htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-password">Пароль</label>
                <div className="password-field">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  {password.length > 0 && (
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
              <p className="muted auth-email-hint">
                На указанный email придёт код подтверждения.
              </p>
              {error && <p className="error">{error}</p>}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Отправка...' : 'Подтвердить почту'}
                </button>
              </div>
              <p style={{ marginTop: '1rem' }}>
                Уже есть аккаунт? <Link to="/login">Войти</Link>
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
        <h1>Регистрация</h1>
        <div className="card auth-card">
          <form className="contact-form" onSubmit={handleVerify}>
            <div className="form-group">
              <label htmlFor="reg-email-readonly">Email</label>
              <input
                id="reg-email-readonly"
                type="email"
                value={email}
                readOnly
                className="readonly-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-code">Код из письма</label>
              <input
                id="reg-code"
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
              <button type="button" className="btn btn-secondary" onClick={() => setStep('email')} disabled={loading}>
                Назад
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Вход...' : 'Подтвердить и войти'}
              </button>
            </div>
            <p style={{ marginTop: '1rem' }}>
              Уже есть аккаунт? <Link to="/login">Войти</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
