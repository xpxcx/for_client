import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageNavButtons from '../../components/PageNavButtons'
import Pagination, { PAGE_SIZE } from '../../components/Pagination'
import './NewsPage.css'

const API = '/api/news'

interface NewsItem {
  id: string
  date: string
  title: string
  text: string
  sourceType?: string | null
  achievementId?: number | null
  materialId?: number | null
  linkId?: number | null
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

function parseLinkNewsText(text: string): { url: string; description: string } {
  const parts = (text || '').split(/\r?\n/)
  const last = parts[parts.length - 1]?.trim() ?? ''
  const isUrl = /^https?:\/\//i.test(last)
  if (parts.length >= 2 && isUrl) {
    return { url: last, description: parts.slice(0, -1).join('\n').trim() }
  }
  if (parts.length === 1 && isUrl) {
    return { url: last, description: '' }
  }
  return { url: '', description: text }
}

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

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
          <>
            {items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((item) => {
              const isLink = item.sourceType === 'link'
              const { url, description } = isLink ? parseLinkNewsText(item.text) : { url: '', description: item.text }
              const cardHref =
                isLink && url
                  ? url
                  : item.sourceType === 'achievement' && item.achievementId != null
                    ? `/achievements#achievement-${item.achievementId}`
                    : item.sourceType === 'material' && item.materialId != null
                      ? `/materials#material-${item.materialId}`
                      : null
              const content = (
                <>
                  <div className="news-source">{getNewsSourceLabel(item.sourceType)}</div>
                  <div className="news-date">{formatDate(item.date)}</div>
                  <h2 className="news-title">{item.title}</h2>
                  {description ? <p>{description}</p> : null}
                </>
              )
              if (cardHref) {
                if (isLink && url) {
                  return (
                    <a
                      key={item.id}
                      href={cardHref}
                      target="_blank"
                      rel="noreferrer"
                      className="news-item card news-item-link"
                    >
                      {content}
                    </a>
                  )
                }
                return (
                  <Link key={item.id} to={cardHref} className="news-item card news-item-link">
                    {content}
                  </Link>
                )
              }
              return (
                <article key={item.id} className="news-item card">
                  {content}
                </article>
              )
            })}
            <Pagination totalItems={items.length} currentPage={page} onPageChange={setPage} />
          </>
        )}
      </div>
      <PageNavButtons />
    </section>
  )
}
