import { useEffect, useState } from 'react'
import './HomePage.css'

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
      </div>
    </section>
  )
}
