import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, setToken } from '../../api/auth'
import './LoginPage.css'

export default function LoginPage() {
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
      const { access_token } = await login(username, password)
      setToken(access_token)
      navigate('/cabinet', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page auth-page">
      <div className="auth-box">
        <h1>Вход</h1>
        <div className="card auth-card">
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-username">Логин</label>
            <input
              id="login-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Пароль</label>
            <div className="password-field">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </div>
          <p style={{ marginTop: '1rem' }}>
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </form>
        </div>
      </div>
    </section>
  )
}
