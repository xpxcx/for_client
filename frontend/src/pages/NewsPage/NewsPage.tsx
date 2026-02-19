import { useEffect, useState } from 'react'
import PageNavButtons from '../../components/PageNavButtons'
import './NewsPage.css'

const API = '/api/news'

interface NewsItem {
  id: string
  date: string
  title: string
  text: string
  sourceType?: string | null
}

function getNewsSourceLabel(sourceType: string | null | undefined): string {
  switch (sourceType) {
    case 'achievement':
      return 'Добавлено новое достижение'
    case 'material':
      return 'Добавлен новый материал'
    case 'link':
      return 'Добавлена новая ссылка'
    default:
      return 'Новость'
  }
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(API)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.json()
      })
      .then(setItems)
      .catch(() => setError('Не удалось загрузить новости'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <section className="page"><div className="card"><p>Загрузка...</p></div></section>
  if (error) return <section className="page"><div className="card"><p className="error">{error}</p></div></section>

  return (
    <section className="page news-page">
      <h1>Новости</h1>
      <div className="news-list">
        {items.length === 0 ? (
          <div className="card news-empty">
            <p>За последнюю неделю нет новостей</p>
          </div>
        ) : (
          items.map((item) => (
            <article key={item.id} className="news-item card">
              <div className="news-source">{getNewsSourceLabel(item.sourceType)}</div>
              <div className="news-date">{formatDate(item.date)}</div>
              <h2 className="news-title">{item.title}</h2>
              <p>{item.text}</p>
            </article>
          ))
        )}
      </div>
      <PageNavButtons />
    </section>
  )
}
