import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API = '/api'

export default function HomePage() {
  const [message, setMessage] = useState<string>('...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(API)
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error(String(res.status)))))
      .then(setMessage)
      .catch(() => setError('Сервер недоступен'))
  }, [])

  return (
    <section className="page home-page">
      <div className="hero">
        <h1>Добро пожаловать на сайт-портфолио</h1>
        <p>Профессиональная деятельность педагога</p>
      </div>
      <div className="card">
        {error ? (
          <p className="error">{error}</p>
        ) : (
          <p>Статус API: <strong>{message}</strong></p>
        )}
        <p>Используйте боковое меню для перехода по разделам.</p>
        <p>
          <Link to="/about">О себе</Link> · <Link to="/materials">Материалы</Link> · <Link to="/news">Новости</Link>
        </p>
      </div>
    </section>
  )
}
