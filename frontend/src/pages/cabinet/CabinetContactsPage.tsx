import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ContactItem } from '../../api/contact'
import { contactKeys, fetchContacts, deleteContact } from '../../api/contact'

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function CabinetContactsPage() {
  const queryClient = useQueryClient()
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: contactKeys.list(),
    queryFn: fetchContacts,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.list() })
    },
  })

  const handleDelete = (id: string) => {
    if (!confirm('Удалить это обращение?')) return
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
      <h2>Управление контактами</h2>
      <p className="cabinet-hint">Сообщения, отправленные через форму обратной связи.</p>
      <div className="card">
        <h3>Обращения</h3>
        {items.length === 0 ? (
          <p className="cabinet-empty-message">Обращений пока нет.</p>
        ) : (
          <ul className="cabinet-list cabinet-contacts-list">
            {items.map((item: ContactItem) => (
              <li key={item.id} className="cabinet-list-item">
                <div>
                  <strong>{item.name}</strong>
                  {item.email && (
                    <span className="cabinet-list-meta">
                      <a href={`mailto:${item.email}`}>{item.email}</a>
                    </span>
                  )}
                  {item.category && (
                    <span className="cabinet-list-meta">Категория: {item.category}</span>
                  )}
                  <span className="cabinet-list-meta">{formatDate(item.createdAt)}</span>
                  {item.message && (
                    <p className="cabinet-list-desc cabinet-contact-message">{item.message}</p>
                  )}
                </div>
                <div className="cabinet-list-actions">
                  <button
                    type="button"
                    className="btn btn-small btn-danger"
                    onClick={() => handleDelete(item.id)}
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
