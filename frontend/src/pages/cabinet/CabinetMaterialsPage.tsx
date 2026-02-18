import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { Material } from '../../api/materials'
import {
  materialsKeys,
  fetchMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from '../../api/materials'

const emptyForm = { title: '', description: '', fileUrl: '' }

export default function CabinetMaterialsPage() {
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const queryClient = useQueryClient()

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: materialsKeys.list(),
    queryFn: fetchMaterials,
  })

  const createMutation = useMutation({
    mutationFn: createMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialsKeys.list() })
      setForm(emptyForm)
      setShowAdd(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateMaterial>[1] }) =>
      updateMaterial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialsKeys.list() })
      setEditingId(null)
      setForm(emptyForm)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialsKeys.list() })
    },
  })

  const startEdit = (m: Material) => {
    setEditingId(m.id)
    setShowAdd(false)
    setForm({
      title: m.title,
      description: m.description,
      fileUrl: m.fileUrl || '',
    })
  }

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    createMutation.mutate({
      title: form.title,
      description: form.description,
      fileUrl: form.fileUrl || undefined,
    })
  }

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId || !form.title.trim()) return
    updateMutation.mutate({
      id: editingId,
      data: { title: form.title, description: form.description, fileUrl: form.fileUrl || undefined },
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
    if (!confirm('Удалить этот материал?')) return
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
      <h2>Управление материалами</h2>
      {showAdd && (
        <div className="card cabinet-form-card">
          <h3>Добавить материал</h3>
          <form className="contact-form" onSubmit={handleSubmitAdd}>
            <div className="form-group">
              <label htmlFor="mat-add-title">Название</label>
              <input
                id="mat-add-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="mat-add-desc">Описание</label>
              <textarea
                id="mat-add-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label htmlFor="mat-add-url">Ссылка на файл</label>
              <input
                id="mat-add-url"
                value={form.fileUrl}
                onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))}
                placeholder="https://..."
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
            Добавить материал
          </button>
        </p>
      )}
      {editingId && (
        <div className="card cabinet-form-card">
          <h3>Редактирование материала</h3>
          <form className="contact-form" onSubmit={handleSubmitEdit}>
            <div className="form-group">
              <label htmlFor="mat-edit-title">Название</label>
              <input
                id="mat-edit-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="mat-edit-desc">Описание</label>
              <textarea
                id="mat-edit-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label htmlFor="mat-edit-url">Ссылка на файл</label>
              <input
                id="mat-edit-url"
                value={form.fileUrl}
                onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))}
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
        <h3>Список материалов</h3>
        {items.length === 0 ? (
          <p>Материалов пока нет.</p>
        ) : (
          <ul className="cabinet-list">
            {items.map((item) => (
              <li key={item.id} className="cabinet-list-item">
                <div>
                  <strong>{item.title}</strong>
                  {item.description && <p className="cabinet-list-desc">{item.description}</p>}
                  {item.fileUrl && (
                    <a href={item.fileUrl} target="_blank" rel="noreferrer" className="link">
                      Ссылка на файл
                    </a>
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
