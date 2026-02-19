import { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'

const API = '/api/content'

interface Content {
  id: string
  title: string
  body: string
  fullName?: string
  birthDate?: string
  imageUrl?: string
  education?: string
  experience?: string
}

export default function ContentPage() {
  const { id: paramId } = useParams<{ id: string }>()
  const location = useLocation()
  const id = paramId ?? (location.pathname === '/' ? 'about' : null)
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    fetch(`${API}/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setContent(data)
      })
      .catch(() => setError('Раздел не найден'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <section className="page"><div className="card"><p>Загрузка...</p></div></section>
  if (error || !content) return <section className="page"><div className="card"><p className="error">{error}</p></div></section>

  if (id === 'about') {
    return (
      <section className="page content-page about-block">
        <h1 className="about-block-title">{content.title}</h1>
        <div className="about-block-inner card">
          <div className="about-photo">
            {content.imageUrl ? (
              <img src={content.imageUrl} alt="" />
            ) : (
              <div className="about-photo-placeholder">Фото</div>
            )}
          </div>
          <div className="about-right">
            {(content.fullName || content.birthDate) && (
              <div className="about-fio-block">
                {content.fullName && <h2 className="about-fio">{content.fullName}</h2>}
                {content.birthDate && <p className="about-birth-date">Дата рождения: {content.birthDate}</p>}
              </div>
            )}
            {content.education != null && content.education !== '' && (
              <div className="about-section">
                <h3>Образование</h3>
                <p>{content.education}</p>
              </div>
            )}
            {content.experience != null && content.experience !== '' && (
              <div className="about-section">
                <h3>Опыт работы</h3>
                <p>{content.experience}</p>
              </div>
            )}
            <div className="about-section">
              <h3>О себе</h3>
              <p>{content.body}</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page content-page">
      <h1>{content.title}</h1>
      <div className="card">
        <p>{content.body}</p>
      </div>
    </section>
  )
}
