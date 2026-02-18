import { useQuery } from '@tanstack/react-query'
import { fetchContactInfo, contactInfoKeys } from '../api/contact-info'
import './ContactPage.css'

export default function ContactPage() {
  const { data: contactInfo, isLoading, error } = useQuery({
    queryKey: contactInfoKeys.get(),
    queryFn: fetchContactInfo,
  })

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
    </section>
  )
}
