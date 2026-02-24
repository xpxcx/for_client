import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { Section } from '../../../api/menu'
import { menuKeys, fetchSections, updateSections } from '../../../api/menu'
import Pagination, { PAGE_SIZE } from '../../../components/Pagination'
import './CabinetMenuPage.css'

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

function transliterate(str: string): string {
  return str
    .split('')
    .map((char) => {
      const lower = char.toLowerCase()
      const mapped = CYRILLIC_TO_LATIN[lower]
      if (mapped !== undefined) return char === lower ? mapped : mapped.charAt(0).toUpperCase() + mapped.slice(1)
      return char
    })
    .join('')
}

function titleToPath(title: string): string {
  const s = transliterate(title.trim()).toLowerCase()
  const slug = s
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return slug ? `/${slug}` : ''
}

function slugify(title: string): string {
  const path = titleToPath(title)
  return path.slice(1) || `item-${Date.now()}`
}

const emptyForm = { title: '', path: '', description: '' }

const NON_DELETABLE_IDS = new Set(['about', 'achievements', 'materials', 'news', 'contact'])

export default function CabinetMenuPage() {
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: menuKeys.list(),
    queryFn: fetchSections,
  })

  const updateMutation = useMutation({
    mutationFn: updateSections,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.list() })
      setEditingId(null)
      setForm(emptyForm)
    },
  })

  const startEdit = (s: Section) => {
    setEditingId(s.id)
    setShowAdd(false)
    setForm({ title: s.title, path: s.path, description: s.description ?? '' })
  }

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const path = titleToPath(form.title.trim()) || '/'
    let id = slugify(form.title)
    if (items.some((s) => s.id === id)) id = `${id}-${Date.now()}`
    const newItem: Section = { id, title: form.title.trim(), path, description: form.description.trim() || undefined }
    const next = [...items, newItem]
    updateMutation.mutate(next)
    setShowAdd(false)
    setForm(emptyForm)
  }

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId || !form.title.trim()) return
    const path = form.path.trim()
      ? (form.path.startsWith('/') ? form.path : `/${form.path}`)
      : titleToPath(form.title.trim()) || '/'
    const next = items.map((s) =>
      s.id === editingId ? { ...s, title: form.title.trim(), path, description: form.description.trim() || undefined } : s
    )
    updateMutation.mutate(next)
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
    if (!confirm('Удалить этот пункт меню?')) return
    const next = items.filter((s) => s.id !== id)
    updateMutation.mutate(next)
  }

  const listItems = items.filter(
    (s) => s.id !== 'home' && s.id !== 'cabinet' && !NON_DELETABLE_IDS.has(s.id)
  )
  const submitting = updateMutation.isPending
  const mutationError = updateMutation.error

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
      <h2>Управление меню</h2>
      <p className="cabinet-hint">
        Добавляйте, редактируйте и удаляйте пункты меню сайта.
      </p>
      {showAdd && (
        <div className="card cabinet-form-card">
          <h3>Добавить пункт меню</h3>
          <form className="contact-form" onSubmit={handleSubmitAdd}>
            <div className="form-group">
              <label htmlFor="menu-add-title">Название</label>
              <input
                id="menu-add-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Например: Материалы"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="menu-add-desc">Описание</label>
              <textarea
                id="menu-add-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Например: Открытые уроки, видеоматериалы, презентации и документы."
                rows={2}
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
            Добавить пункт меню
          </button>
        </p>
      )}
      {editingId && (
        <div className="card cabinet-form-card">
          <h3>Редактирование пункта</h3>
          <form className="contact-form" onSubmit={handleSubmitEdit}>
            <div className="form-group">
              <label htmlFor="menu-edit-title">Название</label>
              <input
                id="menu-edit-title"
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value
                  setForm((f) => ({ ...f, title, path: titleToPath(title) }))
                }}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="menu-edit-path">Путь (URL)</label>
              <input
                id="menu-edit-path"
                value={form.path}
                onChange={(e) => setForm((f) => ({ ...f, path: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="menu-edit-desc">Описание</label>
              <textarea
                id="menu-edit-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Краткое описание раздела"
                rows={2}
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
        <h3>Список пунктов меню</h3>
        {listItems.length === 0 ? (
          <p className="cabinet-empty-message">Пунктов меню пока нет.</p>
        ) : (
          <>
            <ul className="cabinet-list cabinet-menu-list">
              {listItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((item) => (
                <li key={item.id} className="cabinet-list-item">
                  <div className="cabinet-menu-item-info">
                    <strong>{item.title}</strong>
                    <span className="cabinet-list-meta">{item.path}</span>
                    {item.description && <p className="cabinet-list-desc">{item.description}</p>}
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
            <Pagination totalItems={listItems.length} currentPage={page} onPageChange={setPage} />
          </>
        )}
      </div>
    </>
  )
}
