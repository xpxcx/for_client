import { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'

const API = '/api/content'

interface Content {
  id: string
  title: string
  body: string
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

  return (
    <section className="page content-page">
      <h1>{content.title}</h1>
      <div className="card">
        <p>{content.body}</p>
      </div>
    </section>
  )
}
