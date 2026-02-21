import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import type { Achievement } from '../../../api/achievements'
import {
  achievementsKeys,
  createAchievement,
  deleteAchievement,
  deleteAchievementPhoto,
  fetchAchievements,
  updateAchievement,
  uploadImage,
} from '../../../api/achievements'
import './CabinetManagePage.css'

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return dateStr
  }
}

const emptyForm = { title: '', description: '', date: new Date().toISOString().slice(0, 10), imageUrl: '' }

export default function CabinetManagePage() {
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [replaceFile, setReplaceFile] = useState<File | null>(null)
  const [addFile, setAddFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addFileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: achievementsKeys.list(),
    queryFn: fetchAchievements,
  })

  const uploadMutation = useMutation({
    mutationFn: uploadImage,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateAchievement>[1] }) =>
      updateAchievement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementsKeys.list() })
      setEditingId(null)
      setForm(emptyForm)
      setReplaceFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAchievement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementsKeys.list() })
    },
  })

  const deletePhotoMutation = useMutation({
    mutationFn: deleteAchievementPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementsKeys.list() })
      if (editingId) {
        setForm((f) => ({ ...f, imageUrl: '' }))
      }
    },
  })

  const createMutation = useMutation({
    mutationFn: createAchievement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementsKeys.list() })
      setForm(emptyForm)
      setAddFile(null)
      setShowAdd(false)
      if (addFileInputRef.current) addFileInputRef.current.value = ''
    },
  })

  const startEdit = (a: Achievement) => {
    setShowAdd(false)
    setAddFile(null)
    if (addFileInputRef.current) addFileInputRef.current.value = ''
    setEditingId(a.id)
    setReplaceFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setForm({
      title: a.title,
      description: a.description,
      date: a.date.slice(0, 10),
      imageUrl: a.imageUrl || '',
    })
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId || !form.title.trim()) return
    let imageUrl: string | undefined = form.imageUrl || undefined
    if (replaceFile) {
      try {
        const result = await uploadMutation.mutateAsync(replaceFile)
        imageUrl = result.imageUrl
      } catch {
        return
      }
    }
    updateMutation.mutate({
      id: editingId,
      data: { title: form.title, description: form.description, date: form.date, imageUrl },
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
    setReplaceFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    let imageUrl: string | undefined
    if (addFile) {
      try {
        const result = await uploadMutation.mutateAsync(addFile)
        imageUrl = result.imageUrl
      } catch {
        return
      }
    }
    createMutation.mutate({ ...form, imageUrl })
  }

  const cancelAdd = () => {
    setShowAdd(false)
    setForm(emptyForm)
    setAddFile(null)
    if (addFileInputRef.current) addFileInputRef.current.value = ''
  }

  const submitting =
    uploadMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    deletePhotoMutation.isPending ||
    createMutation.isPending
  const mutationError =
    uploadMutation.error || updateMutation.error || deleteMutation.error || deletePhotoMutation.error || createMutation.error

  const handleDelete = (id: string) => {
    if (!confirm('Удалить это достижение?')) return
    deleteMutation.mutate(id)
  }

  if (isLoading) return <div className="card"><p>Загрузка...</p></div>
  if (error || mutationError)
    return (
      <div className="card">
        <p className="error">
          {error instanceof Error ? error.message : mutationError instanceof Error ? mutationError.message : 'Произошла ошибка'}
        </p>
      </div>
    )

  return (
    <>
      <h2>Управление достижениями</h2>
      {showAdd && (
        <div className="card cabinet-form-card">
          <h3>Добавление достижения</h3>
          <form className="contact-form" onSubmit={handleAdd}>
            <div className="form-group">
              <label htmlFor="manage-add-title">Название</label>
              <input
                id="manage-add-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="manage-add-desc">Описание</label>
              <textarea
                id="manage-add-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label htmlFor="manage-add-date">Дата</label>
              <input
                id="manage-add-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="manage-add-image">Фотография</label>
              <input
                id="manage-add-image"
                ref={addFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setAddFile(e.target.files?.[0] ?? null)}
              />
              {addFile && <p className="form-file-hint">{addFile.name}</p>}
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                Добавить
              </button>
              <button type="button" className="btn btn-secondary" onClick={cancelAdd}>
                Отмена
              </button>
            </div>
            {(uploadMutation.error ?? createMutation.error) && (
              <p className="error">
                {(() => {
                  const err: unknown = uploadMutation.error ?? createMutation.error
                  return err instanceof Error ? err.message : 'Произошла ошибка'
                })()}
              </p>
            )}
            {createMutation.isSuccess && !createMutation.isPending && (
              <p className="success">Достижение добавлено.</p>
            )}
          </form>
        </div>
      )}
      {!showAdd && !editingId && (
        <p>
          <button type="button" className="btn btn-primary" onClick={() => setShowAdd(true)}>
            Добавить достижение
          </button>
        </p>
      )}
      {editingId && (
        <div className="card cabinet-form-card">
          <h2>Редактирование достижения</h2>
          <form className="contact-form" onSubmit={handleEdit}>
            <div className="form-group">
              <label htmlFor="manage-title">Название</label>
              <input
                id="manage-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="manage-desc">Описание</label>
              <textarea
                id="manage-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label htmlFor="manage-date">Дата</label>
              <input
                id="manage-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="manage-image">Фотография</label>
              {form.imageUrl ? (
                <div>
                  <p className="form-file-hint" style={{ marginBottom: '0.5rem' }}>
                    Текущее фото: <img src={form.imageUrl} alt="" style={{ maxWidth: 120, maxHeight: 80, objectFit: 'cover', verticalAlign: 'middle' }} />
                  </p>
                  <button
                    type="button"
                    className="btn btn-small btn-danger"
                    onClick={() => {
                      if (confirm('Удалить фотографию?')) {
                        deletePhotoMutation.mutate(editingId!)
                      }
                    }}
                    disabled={deletePhotoMutation.isPending}
                  >
                    {deletePhotoMutation.isPending ? 'Удаление...' : 'Удалить фото'}
                  </button>
                </div>
              ) : (
                <>
                  <input
                    id="manage-image"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setReplaceFile(e.target.files?.[0] ?? null)}
                  />
                  {replaceFile && <p className="form-file-hint">Файл: {replaceFile.name}</p>}
                </>
              )}
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

      <div className="card cabinet-list-card">
        <h3>Список достижений</h3>
        {items.length === 0 ? (
          <p className="cabinet-empty-message">Достижений пока нет. Нажмите «Добавить достижение» выше.</p>
        ) : (
          <div className="achievements-list">
          {items.map((item) => (
            <article key={item.id} className="card achievement-item achievement-card">
              <div className="achievement-actions">
                <button
                  type="button"
                  className="btn btn-small btn-secondary"
                  onClick={() => startEdit(item)}
                  disabled={submitting || updateMutation.isPending}
                >
                  Редактировать
                </button>
                <button
                  type="button"
                  className="btn btn-small btn-danger"
                  onClick={() => handleDelete(item.id)}
                  disabled={submitting || deleteMutation.isPending}
                >
                  Удалить
                </button>
              </div>
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
          ))}
          </div>
        )}
      </div>
    </>
  )
}
