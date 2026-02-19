import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchContactInfo, contactInfoKeys } from '../api/contact-info'
import { sendContactForm } from '../api/contact'
import './ContactPage.css'

export default function ContactPage() {
  const { data: contactInfo, isLoading, error } = useQuery({
    queryKey: contactInfoKeys.get(),
    queryFn: fetchContactInfo,
  })

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'student',
    message: '',
  })
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormStatus('sending')
    setFormError(null)

    try {
      await sendContactForm(formData)
      setFormStatus('success')
      setFormData({ name: '', email: '', category: 'student', message: '' })
      setTimeout(() => setFormStatus('idle'), 3000)
    } catch (err) {
      setFormStatus('error')
      setFormError(err instanceof Error ? err.message : 'Ошибка отправки сообщения')
    }
  }

  return (
    <section className="page contact-page">
      <h1>Контакты</h1>
      {isLoading && <div className="card"><p>Загрузка...</p></div>}
      {error && (
        <div className="card">
          <p className="error">{error instanceof Error ? error.message : 'Ошибка загрузки'}</p>
        </div>
      )}
      {contactInfo && (
        <div className="contact-info-block">
          <div className="card contact-info-card">
            {contactInfo.phone && (
              <div className="contact-info-item">
                <span className="contact-info-label">Телефон</span>
                <a href={`tel:${contactInfo.phone.replace(/\s/g, '')}`} className="contact-info-value">
                  {contactInfo.phone}
                </a>
              </div>
            )}
            {contactInfo.email && (
              <div className="contact-info-item">
                <span className="contact-info-label">Почта</span>
                <a href={`mailto:${contactInfo.email}`} className="contact-info-value">
                  {contactInfo.email}
                </a>
              </div>
            )}
            {contactInfo.socialNetworks && contactInfo.socialNetworks.length > 0 && (
              <div className="contact-info-item contact-info-social">
                <span className="contact-info-label">Социальные сети</span>
                <div className="contact-social-list">
                  {contactInfo.socialNetworks.map((sn, i) => (
                    <a
                      key={i}
                      href={sn.url}
                      target="_blank"
                      rel="noreferrer"
                      className="contact-social-link"
                    >
                      {sn.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {!contactInfo.phone && !contactInfo.email && (!contactInfo.socialNetworks || contactInfo.socialNetworks.length === 0) && (
              <p className="contact-info-empty">Контактные данные пока не добавлены.</p>
            )}
          </div>
        </div>
      )}

      <div className="contact-form-block">
        <div className="card contact-form-card">
          <h2>Обратная связь</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="contact-form-name">Имя *</label>
              <input
                id="contact-form-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={formStatus === 'sending'}
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-form-email">Email *</label>
              <input
                id="contact-form-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={formStatus === 'sending'}
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-form-category">Категория</label>
              <select
                id="contact-form-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={formStatus === 'sending'}
              >
                <option value="student">Обучающийся</option>
                <option value="parent">Родитель</option>
                <option value="colleague">Коллега</option>
                <option value="other">Другое</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="contact-form-message">Сообщение *</label>
              <textarea
                id="contact-form-message"
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                disabled={formStatus === 'sending'}
              />
            </div>
            {formStatus === 'error' && formError && (
              <div className="form-error">
                <p className="error">{formError}</p>
              </div>
            )}
            {formStatus === 'success' && (
              <div className="form-success">
                <p className="success">Сообщение отправлено успешно!</p>
              </div>
            )}
            <button type="submit" className="btn" disabled={formStatus === 'sending'}>
              {formStatus === 'sending' ? 'Отправка...' : 'Отправить'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
