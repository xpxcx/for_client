import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Section, SectionItem } from '../../../api/menu'
import {
  menuKeys,
  fetchSections,
  fetchSectionItems,
  sectionItemsKeys,
  createSectionItem,
  updateSectionItem,
  deleteSectionItem,
  uploadSectionItemFile,
} from '../../../api/menu'
import Pagination, { PAGE_SIZE } from '../../../components/Pagination'
import './CabinetSectionPage.css'

const TITLE_PREFIX = 'Крумова Эльмира Мамедовна, Сургут - '

const emptyForm = { title: '', description: '', link: '' }

export default function CabinetSectionPage() {
  const { id: sectionId } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [form, setForm] = useState(emptyForm)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [page, setPage] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const addFileRef = useRef<HTMLInputElement>(null)
  const editFileRef = useRef<HTMLInputElement>(null)

  const { data: sections = [] } = useQuery({
    queryKey: menuKeys.list(),
    queryFn: fetchSections,
  })

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: sectionItemsKeys.list(sectionId ?? ''),
    queryFn: () => fetchSectionItems(sectionId!),
    enabled: !!sectionId,
  })

  const section = sectionId ? sections.find((s) => s.id === sectionId) : null

  useEffect(() => {
    if (section) document.title = `${TITLE_PREFIX}Управление «${section.title}»`
    return () => { document.title = `${TITLE_PREFIX}Личный кабинет` }
  }, [section?.id, section?.title])

  const createMutation = useMutation({
    mutationFn: (data: { title: string; description?: string; link?: string }) =>
      createSectionItem(sectionId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sectionItemsKeys.list(sectionId!) })
      setForm(emptyForm)
      setShowAdd(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: { title?: string; description?: string; link?: string } }) =>
      updateSectionItem(sectionId!, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sectionItemsKeys.list(sectionId!) })
      setEditingItemId(null)
      setForm(emptyForm)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => deleteSectionItem(sectionId!, itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sectionItemsKeys.list(sectionId!) }),
  })

  const startEdit = (item: SectionItem) => {
    setEditingItemId(item.id)
    setShowAdd(false)
    setForm({
      title: item.title,
      description: item.description ?? '',
      link: item.link ?? '',
    })
  }

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    createMutation.mutate({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      link: form.link.trim() || undefined,
    })
  }

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItemId || !form.title.trim()) return
    updateMutation.mutate({
      itemId: editingItemId,
      data: {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        link: form.link.trim() || undefined,
      },
    })
  }

  const cancelEdit = () => {
    setEditingItemId(null)
    setForm(emptyForm)
  }

  const cancelAdd = () => {
    setShowAdd(false)
    setForm(emptyForm)
  }

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploading(true)
    uploadSectionItemFile(file)
      .then((r) => {
        setForm((f) => ({ ...f, link: r.fileUrl }))
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
    uploadSectionItemFile(file)
      .then((r) => {
        setForm((f) => ({ ...f, link: r.fileUrl }))
        setUploading(false)
        if (editFileRef.current) editFileRef.current.value = ''
      })
      .catch((err) => {
        setUploadError(err instanceof Error ? err.message : 'Ошибка загрузки')
        setUploading(false)
        if (editFileRef.current) editFileRef.current.value = ''
      })
  }

  const handleDelete = (itemId: string) => {
    if (!confirm('Удалить этот пункт?')) return
    deleteMutation.mutate(itemId)
  }

  const submitting =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || uploading
  const mutationError = createMutation.error || updateMutation.error || deleteMutation.error

  if (!sectionId)
    return (
      <div className="card">
        <p className="error">Раздел не указан.</p>
      </div>
    )
  if (!section)
    return (
      <div className="card">
        <p className="error">Раздел не найден.</p>
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
      <h2>Управление «{section.title}»</h2>
      {section.description && <p className="cabinet-hint">{section.description}</p>}
      {showAdd && (
        <div className="card cabinet-form-card">
          <h3>Добавить «{section.title}»</h3>
          <form className="contact-form" onSubmit={handleSubmitAdd}>
            <div className="form-group">
              <label htmlFor="section-item-add-title">Название</label>
              <input
                id="section-item-add-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="section-item-add-desc">Описание</label>
              <textarea
                id="section-item-add-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="form-group">
              <label htmlFor="section-item-add-link">Ссылка или файл</label>
              {form.link ? (
                <div>
                  <p className="form-file-hint" style={{ marginBottom: '0.5rem' }}>
                    <a href={form.link} target="_blank" rel="noreferrer">{form.link}</a>
                  </p>
                  <button
                    type="button"
                    className="btn btn-small btn-danger"
                    onClick={() => setForm((f) => ({ ...f, link: '' }))}
                  >
                    Удалить
                  </button>
                </div>
              ) : (
                <>
                  <input
                    id="section-item-add-link"
                    value={form.link}
                    onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                    placeholder="https://... или прикрепите файл ниже"
                  />
                  <div className="form-group-file-upload">
                    <span className="form-group-file-or">или</span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-small"
                      onClick={() => addFileRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? 'Загрузка...' : 'Прикрепить файл'}
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
            Добавить «{section.title}»
          </button>
        </p>
      )}
      {editingItemId && (
        <div className="card cabinet-form-card">
          <h3>Редактирование</h3>
          <form className="contact-form" onSubmit={handleSubmitEdit}>
            <div className="form-group">
              <label htmlFor="section-item-edit-title">Название</label>
              <input
                id="section-item-edit-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="section-item-edit-desc">Описание</label>
              <textarea
                id="section-item-edit-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="form-group">
              <label htmlFor="section-item-edit-link">Ссылка или файл</label>
              {form.link ? (
                <div>
                  <p className="form-file-hint" style={{ marginBottom: '0.5rem' }}>
                    <a href={form.link} target="_blank" rel="noreferrer">{form.link}</a>
                  </p>
                  <button
                    type="button"
                    className="btn btn-small btn-danger"
                    onClick={() => setForm((f) => ({ ...f, link: '' }))}
                  >
                    Удалить
                  </button>
                </div>
              ) : (
                <>
                  <input
                    id="section-item-edit-link"
                    value={form.link}
                    onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                    placeholder="https://... или прикрепите файл ниже"
                  />
                  <div className="form-group-file-upload">
                    <span className="form-group-file-or">или</span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-small"
                      onClick={() => editFileRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? 'Загрузка...' : 'Прикрепить файл'}
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
        <h3>Содержимое раздела</h3>
        {isLoading ? (
          <p>Загрузка...</p>
        ) : items.length === 0 ? (
          <p className="cabinet-empty-message">Пунктов пока нет. Добавьте первый.</p>
        ) : (
          <>
            <ul className="cabinet-list">
              {items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((item) => (
                <li key={item.id} className="cabinet-list-item">
                  <div>
                    <strong>{item.title}</strong>
                    {item.description && <p className="cabinet-list-desc">{item.description}</p>}
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noreferrer" className="link">
                        Ссылка
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
