import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useRef } from 'react'
import type { Material } from '../../../api/materials'
import {
  materialsKeys,
  fetchMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  uploadMaterialFile,
} from '../../../api/materials'
import Pagination, { PAGE_SIZE } from '../../../components/Pagination'
import './CabinetMaterialsPage.css'

const emptyForm = { title: '', description: '', fileUrl: '' }

export default function CabinetMaterialsPage() {
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const addFileRef = useRef<HTMLInputElement>(null)
  const editFileRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploading(true)
    uploadMaterialFile(file)
      .then((r) => {
        setForm((f) => ({ ...f, fileUrl: r.fileUrl }))
        setUploading(false)
        if (addFileRef.current) addFileRef.current.value = ''
      })
      .catch((err) => {
        setUploadError(err instanceof Error ? err.message : 'Ошибка загрузки')
        setUploading(false)
        if (addFileRef.current) addFileRef.current.value = ''
      })
  }

  const handleFileEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploading(true)
    uploadMaterialFile(file)
      .then((r) => {
        setForm((f) => ({ ...f, fileUrl: r.fileUrl }))
        setUploading(false)
        if (editFileRef.current) editFileRef.current.value = ''
      })
      .catch((err) => {
        setUploadError(err instanceof Error ? err.message : 'Ошибка загрузки')
        setUploading(false)
        if (editFileRef.current) editFileRef.current.value = ''
      })
  }

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
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || uploading
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
              <label htmlFor="mat-add-url">Файл или ссылка</label>
              {form.fileUrl ? (
                <div>
                  <p className="form-file-hint" style={{ marginBottom: '0.5rem' }}>
                    <a href={form.fileUrl} target="_blank" rel="noreferrer">{form.fileUrl}</a>
                  </p>
                  <button
                    type="button"
                    className="btn btn-small btn-danger"
                    onClick={() => setForm((f) => ({ ...f, fileUrl: '' }))}
                  >
                    Удалить файл/ссылку
                  </button>
                </div>
              ) : (
                <>
                  <input
                    id="mat-add-url"
                    value={form.fileUrl}
                    onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))}
                    placeholder="https://... или загрузите файл ниже"
                  />
                  <div className="form-group-file-upload">
                    <span className="form-group-file-or">или</span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-small"
                      onClick={() => addFileRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? 'Загрузка...' : 'Выбрать файл'}
                    </button>
                    <input
                      ref={addFileRef}
                      type="file"
                      accept="*/*"
                      onChange={handleFileAdd}
                      style={{ display: 'none' }}
                    />
                  </div>
                  {uploadError && <p className="error form-file-error">{uploadError}</p>}
                </>
              )}
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
              <label htmlFor="mat-edit-url">Файл или ссылка</label>
              {form.fileUrl ? (
                <div>
                  <p className="form-file-hint" style={{ marginBottom: '0.5rem' }}>
                    <a href={form.fileUrl} target="_blank" rel="noreferrer">{form.fileUrl}</a>
                  </p>
                  <button
                    type="button"
                    className="btn btn-small btn-danger"
                    onClick={() => setForm((f) => ({ ...f, fileUrl: '' }))}
                  >
                    Удалить файл/ссылку
                  </button>
                </div>
              ) : (
                <>
                  <input
                    id="mat-edit-url"
                    value={form.fileUrl}
                    onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))}
                    placeholder="https://... или загрузите файл ниже"
                  />
                  <div className="form-group-file-upload">
                    <span className="form-group-file-or">или</span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-small"
                      onClick={() => editFileRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? 'Загрузка...' : 'Выбрать файл'}
                    </button>
                    <input
                      ref={editFileRef}
                      type="file"
                      accept="*/*"
                      onChange={handleFileEdit}
                      style={{ display: 'none' }}
                    />
                  </div>
                  {uploadError && <p className="error form-file-error">{uploadError}</p>}
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
      <div className="card">
        <h3>Список материалов</h3>
        {items.length === 0 ? (
          <p className="cabinet-empty-message">Материалов пока нет.</p>
        ) : (
          <>
          <ul className="cabinet-list">
            {items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((item) => (
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
          <Pagination totalItems={items.length} currentPage={page} onPageChange={setPage} />
          </>
        )}
      </div>
    </>
  )
}
