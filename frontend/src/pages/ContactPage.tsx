import { useState } from 'react'

const API = '/api/contact'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('student')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, category, message }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(() => setStatus('ok'))
      .catch(() => setStatus('error'))
  }

  return (
    <section className="page contact-page">
      <h1>Обратная связь</h1>
      <div className="card">
        <p>Email: teacher@example.com · Телефон: +7 (XXX) XXX-XX-XX</p>
      </div>
      <form className="contact-form card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="contact-name">Имя *</label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="contact-email">Email *</label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="contact-category">Категория</label>
          <select
            id="contact-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="student">Обучающийся</option>
            <option value="parent">Родитель</option>
            <option value="colleague">Коллега</option>
            <option value="other">Другое</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="contact-message">Сообщение *</label>
          <textarea
            id="contact-message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn" disabled={status === 'sending'}>
          {status === 'sending' ? 'Отправка...' : 'Отправить'}
        </button>
        {status === 'ok' && <p className="success">Сообщение отправлено.</p>}
        {status === 'error' && <p className="error">Ошибка отправки.</p>}
      </form>
    </section>
  )
}
