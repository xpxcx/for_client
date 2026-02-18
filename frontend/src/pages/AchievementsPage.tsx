import { useQuery } from '@tanstack/react-query'
import type { Achievement } from '../api/achievements'
import { achievementsKeys, fetchAchievements } from '../api/achievements'

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function AchievementCard({ item }: { item: Achievement }) {
  return (
    <article className="card achievement-item achievement-card">
      <div className="achievement-card-content">
        {item.imageUrl ? (
          <div className="achievement-card-img-wrap">
            <img src={item.imageUrl} alt="" className="achievement-card-img" />
          </div>
        ) : (
          <div className="achievement-card-placeholder">Нет фото</div>
        )}
        <div className="achievement-card-info">
          <div className="achievement-date">{formatDate(item.date)}</div>
          <h3 className="achievement-title">{item.title}</h3>
          {item.description && <p className="achievement-desc">{item.description}</p>}
        </div>
      </div>
    </article>
  )
}

export default function AchievementsPage() {
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: achievementsKeys.list(),
    queryFn: fetchAchievements,
  })

  if (isLoading) {
    return (
      <section className="page">
        <h1>Достижения</h1>
        <div className="card"><p>Загрузка...</p></div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="page">
        <h1>Достижения</h1>
        <div className="card"><p className="error">{error instanceof Error ? error.message : 'Не удалось загрузить достижения'}</p></div>
      </section>
    )
  }

  return (
    <section className="page">
      <h1>Достижения</h1>
      <div className="achievements-list">
        {items.length === 0 ? (
          <div className="card"><p>Достижений пока нет.</p></div>
        ) : (
          items.map((item) => <AchievementCard key={item.id} item={item} />)
        )}
      </div>
    </section>
  )
}
