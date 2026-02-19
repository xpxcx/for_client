import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Achievement } from '../../api/achievements'
import { achievementsKeys, fetchAchievements } from '../../api/achievements'
import PageNavButtons from '../../components/PageNavButtons'
import Pagination, { PAGE_SIZE } from '../../components/Pagination'
import './AchievementsPage.css'

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function AchievementCard({ item, onImageClick }: { item: Achievement; onImageClick?: (url: string) => void }) {
  return (
    <article className="card achievement-card">
      <div className="achievement-info-item">
        <span className="achievement-info-label">Дата</span>
        <span className="achievement-info-value">{formatDate(item.date)}</span>
      </div>
      <div className="achievement-info-item">
        <span className="achievement-info-label">Название</span>
        <span className="achievement-info-value achievement-info-title">{item.title}</span>
      </div>
      {item.description && (
        <div className="achievement-info-item">
          <span className="achievement-info-label">Описание</span>
          <p className="achievement-info-desc">{item.description}</p>
        </div>
      )}
      {item.imageUrl ? (
        <div className="achievement-info-item achievement-info-item-photo">
          <span className="achievement-info-label">Фото</span>
          <div
            className="achievement-info-photo achievement-info-photo-clickable"
            onClick={() => onImageClick?.(item.imageUrl!)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onImageClick?.(item.imageUrl!)}
            title="Открыть в полном размере"
          >
            <img src={item.imageUrl} alt="" />
          </div>
        </div>
      ) : (
        <div className="achievement-info-item achievement-info-item-photo">
          <span className="achievement-info-label">Фото</span>
          <div className="achievement-info-photo achievement-info-photo-placeholder">Нет фото</div>
        </div>
      )}
    </article>
  )
}

export default function AchievementsPage() {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxImage(null)
    }
    if (lightboxImage) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = ''
      }
    }
  }, [lightboxImage])

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: achievementsKeys.list(),
    queryFn: fetchAchievements,
  })

  if (isLoading) {
    return (
      <section className="page achievements-page">
        <h1>Достижения</h1>
        <div className="card achievements-empty-card"><p>Загрузка...</p></div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="page achievements-page">
        <h1>Достижения</h1>
        <div className="card achievements-empty-card"><p className="error">{error instanceof Error ? error.message : 'Не удалось загрузить достижения'}</p></div>
      </section>
    )
  }

  const total = items.length
  const from = (page - 1) * PAGE_SIZE
  const pageItems = items.slice(from, from + PAGE_SIZE)

  return (
    <section className="page achievements-page">
      <h1>Достижения</h1>
      <div className="achievements-list">
        {pageItems.length === 0 ? (
          <div className="card achievements-empty-card"><p>Достижений пока нет.</p></div>
        ) : (
          pageItems.map((item) => (
            <AchievementCard key={item.id} item={item} onImageClick={setLightboxImage} />
          ))
        )}
      </div>
      <Pagination totalItems={total} currentPage={page} onPageChange={setPage} />
      {lightboxImage && (
        <div
          className="achievement-lightbox"
          onClick={() => setLightboxImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр изображения"
        >
          <button
            type="button"
            className="achievement-lightbox-close"
            onClick={() => setLightboxImage(null)}
            aria-label="Закрыть"
          >
            ×
          </button>
          <div className="achievement-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImage} alt="" />
          </div>
        </div>
      )}
      <PageNavButtons />
    </section>
  )
}
