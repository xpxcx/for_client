import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register, setToken } from '../../api/auth'
import './RegisterPage.css'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { access_token } = await register(username, password)
      setToken(access_token)
      navigate('/cabinet', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page auth-page">
      <div className="auth-box">
        <h1>Регистрация</h1>
        <div className="card auth-card">
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-username">Логин</label>
            <input
              id="reg-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
          {error && <p className="error">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
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
