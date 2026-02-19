import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchContactInfo, contactInfoKeys } from '../../api/contact-info'
import { sendContactForm } from '../../api/contact'
import PageNavButtons from '../../components/PageNavButtons'
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
  const [categoryOpen, setCategoryOpen] = useState(false)
  const categoryDropdownRef = useRef<HTMLDivElement>(null)

  const categoryOptions: { value: string; label: string }[] = [
    { value: 'student', label: 'Обучающийся' },
    { value: 'parent', label: 'Родитель' },
    { value: 'colleague', label: 'Коллега' },
    { value: 'other', label: 'Другое' },
  ]
  const currentCategoryLabel = categoryOptions.find((o) => o.value === formData.category)?.label ?? formData.category

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setCategoryOpen(false)
      }
    }
    if (categoryOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [categoryOpen])

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
              <label htmlFor="contact-form-name">ФИО *</label>
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
            <div className="form-group" ref={categoryDropdownRef}>
              <label id="contact-form-category-label">Категория</label>
              <div
                className={`contact-form-category-dropdown ${categoryOpen ? 'open' : ''} ${formStatus === 'sending' ? 'disabled' : ''}`}
                role="combobox"
                aria-expanded={categoryOpen}
                aria-haspopup="listbox"
                aria-labelledby="contact-form-category-label"
                aria-controls="contact-form-category-listbox"
                id="contact-form-category"
                onClick={() => formStatus !== 'sending' && setCategoryOpen((v) => !v)}
              >
                <span className="contact-form-category-value">{currentCategoryLabel}</span>
                <span className="contact-form-category-arrow" aria-hidden>▼</span>
              </div>
              <ul
                id="contact-form-category-listbox"
                className="contact-form-category-list"
                role="listbox"
                aria-labelledby="contact-form-category-label"
                hidden={!categoryOpen}
              >
                {categoryOptions.map((opt) => (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={formData.category === opt.value}
                    className={formData.category === opt.value ? 'selected' : ''}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, category: opt.value }))
                      setCategoryOpen(false)
                    }}
                  >
                    {opt.label}
                  </li>
                ))}
              </ul>
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
      <PageNavButtons />
    </section>
  )
}
