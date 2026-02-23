import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { NewsItem } from '../../../api/news'
import { newsKeys, fetchNews, deleteNews, syncNews } from '../../../api/news'
import Pagination, { PAGE_SIZE } from '../../../components/Pagination'
import './CabinetNewsPage.css'

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function getNewsSourceLabel(sourceType: string | null | undefined): string {
  switch (sourceType) {
    case 'achievement':
      return 'Достижение'
    case 'material':
      return 'Материал'
    case 'link':
      return 'Ссылка'
    default:
      return 'Новость'
  }
}

export default function CabinetNewsPage() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: newsKeys.list(),
    queryFn: fetchNews,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.list() })
    },
  })

  const syncMutation = useMutation({
    mutationFn: syncNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newsKeys.list() })
    },
  })

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Удалить новость «${title}»?`)) return
    deleteMutation.mutate(id)
  }

  const submitting = deleteMutation.isPending
  const mutationError = deleteMutation.error

  if (isLoading)
    return (
      <div className="card">
        <p>Загрузка...</p>
      </div>
    )
  if (error || mutationError)
    return (
      <div className="card">
        <p className="error">
          {error instanceof Error
            ? error.message
            : mutationError instanceof Error
              ? mutationError.message
              : 'Произошла ошибка'}
        </p>
      </div>
    )

  return (
    <>
      <h2>Управление новостями</h2>
      <p className="cabinet-hint">
        Новости создаются автоматически при добавлении достижений, материалов и ссылок. Отображаются достижения, материалы и ссылки, добавленные в течении недели.
      </p>
      <div className="card">
        <h3>Список новостей</h3>
        {items.length === 0 ? (
          <p className="cabinet-empty-message">Новостей пока нет.</p>
        ) : (
          <ul className="cabinet-list">
            {items.map((item: NewsItem) => (
              <li key={item.id} className="cabinet-list-item">
                <div>
                  <span className="cabinet-list-source">{getNewsSourceLabel(item.sourceType)}</span>
                  <strong>{item.title}</strong>
                  <span className="cabinet-list-meta">{formatDate(item.date)}</span>
                  {item.text && <p className="cabinet-list-desc">{item.text}</p>}
                </div>
                <div className="cabinet-list-actions">
                  <button
                    type="button"
                    className="btn btn-small btn-danger"
                    onClick={() => handleDelete(item.id, item.title)}
                    disabled={submitting}
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
