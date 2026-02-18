import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { UsefulLink } from '../../api/links'
import {
  linksKeys,
  fetchLinks,
  createLink,
  updateLink,
  deleteLink,
} from '../../api/links'

const emptyForm = { title: '', url: '', description: '' }

export default function CabinetLinksPage() {
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const queryClient = useQueryClient()

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: linksKeys.list(),
    queryFn: fetchLinks,
  })

  const createMutation = useMutation({
    mutationFn: createLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linksKeys.list() })
      setForm(emptyForm)
      setShowAdd(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateLink>[1] }) =>
      updateLink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linksKeys.list() })
      setEditingId(null)
      setForm(emptyForm)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linksKeys.list() })
    },
  })

  const startEdit = (link: UsefulLink) => {
    setEditingId(link.id)
    setShowAdd(false)
    setForm({
      title: link.title,
      url: link.url,
      description: link.description || '',
    })
  }

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.url.trim()) return
    createMutation.mutate({
      title: form.title,
      url: form.url,
      description: form.description || undefined,
    })
  }

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId || !form.title.trim() || !form.url.trim()) return
    updateMutation.mutate({
      id: editingId,
      data: {
        title: form.title,
        url: form.url,
        description: form.description || undefined,
      },
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const cancelAdd = () => {
    setShowAdd(false)
    setForm(emptyForm)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Удалить эту ссылку?')) return
    deleteMutation.mutate(id)
  }

  const submitting =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
  const mutationError = createMutation.error || updateMutation.error || deleteMutation.error

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
      <h2>Управление полезными ссылками</h2>
      {showAdd && (
        <div className="card cabinet-form-card">
          <h3>Добавить ссылку</h3>
          <form className="contact-form" onSubmit={handleSubmitAdd}>
            <div className="form-group">
              <label htmlFor="link-add-title">Название</label>
              <input
                id="link-add-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="link-add-url">URL</label>
              <input
                id="link-add-url"
                type="url"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                required
                placeholder="https://..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="link-add-desc">Описание</label>
              <input
                id="link-add-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                Добавить
              </button>
              <button type="button" className="btn btn-secondary" onClick={cancelAdd}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}
      {!showAdd && (
        <p>
          <button type="button" className="btn btn-primary" onClick={() => setShowAdd(true)}>
            Добавить ссылку
          </button>
        </p>
      )}
      {editingId && (
        <div className="card cabinet-form-card">
          <h3>Редактирование ссылки</h3>
          <form className="contact-form" onSubmit={handleSubmitEdit}>
            <div className="form-group">
              <label htmlFor="link-edit-title">Название</label>
              <input
                id="link-edit-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="link-edit-url">URL</label>
              <input
                id="link-edit-url"
                type="url"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="link-edit-desc">Описание</label>
              <input
                id="link-edit-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                Сохранить
              </button>
              <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="card">
        <h3>Список ссылок</h3>
        {items.length === 0 ? (
          <p>Ссылок пока нет.</p>
        ) : (
          <ul className="cabinet-list">
            {items.map((item) => (
              <li key={item.id} className="cabinet-list-item">
                <div>
                  <a href={item.url} target="_blank" rel="noreferrer" className="link">
                    <strong>{item.title}</strong>
                  </a>
                  {item.description && (
                    <p className="cabinet-list-desc">{item.description}</p>
                  )}
                </div>
                <div className="cabinet-list-actions">
                  <button
                    type="button"
                    className="btn btn-small btn-secondary"
                    onClick={() => startEdit(item)}
                    disabled={submitting}
                  >
                    Редактировать
                  </button>
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
