import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { achievementsKeys, createAchievement, uploadImage } from '../../api/achievements'

const emptyForm = { title: '', description: '', date: new Date().toISOString().slice(0, 10), imageUrl: '' }

export default function CabinetAddPage() {
  const [form, setForm] = useState(emptyForm)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: uploadImage,
  })

  const createMutation = useMutation({
    mutationFn: createAchievement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementsKeys.list() })
      setForm(emptyForm)
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    let imageUrl: string | undefined
    if (file) {
      try {
        const result = await uploadMutation.mutateAsync(file)
        imageUrl = result.imageUrl
      } catch (err) {
        return
      }
    }
    createMutation.mutate({ ...form, imageUrl })
  }

  const error = uploadMutation.error || createMutation.error
  const submitting = uploadMutation.isPending || createMutation.isPending
  const success = createMutation.isSuccess && !createMutation.isPending

  return (
    <div className="card cabinet-form-card">
      <h2>Добавление достижения</h2>
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="cabinet-title">Название</label>
          <input
            id="cabinet-title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="cabinet-desc">Описание</label>
          <textarea
            id="cabinet-desc"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
          />
        </div>
        <div className="form-group">
          <label htmlFor="cabinet-date">Дата</label>
          <input
            id="cabinet-date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label htmlFor="cabinet-image">Фотография</label>
          <input
            id="cabinet-image"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file && <p className="form-file-hint">{file.name}</p>}
        </div>
        <div className="form-actions">
          <button type="submit" className="btn" disabled={submitting}>
            Добавить
          </button>
        </div>
        {error && <p className="error">{error instanceof Error ? error.message : 'Произошла ошибка'}</p>}
        {success && <p className="success">Достижение добавлено.</p>}
      </form>
    </div>
  )
}
