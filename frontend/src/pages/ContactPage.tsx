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
        <span>Здесь будут контакты</span>
    </section>
  )
}
