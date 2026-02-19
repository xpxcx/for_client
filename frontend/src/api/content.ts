import { fetchWithAuth } from './client'

const API = '/api/content'

export type SectionContent = {
  id: string
  title: string
  body: string
  fullName?: string
  birthDate?: string
  imageUrl?: string
  education?: string
  experience?: string
}

export async function fetchContent(id: string): Promise<SectionContent> {
  const res = await fetch(`${API}/${id}`)
  if (!res.ok) throw new Error('Not found')
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data
}

export async function updateContent(
  id: string,
  data: { title?: string; body?: string; fullName?: string; birthDate?: string; imageUrl?: string; education?: string; experience?: string },
): Promise<SectionContent> {
  const res = await fetchWithAuth(`${API}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Ошибка: ${res.status}`)
  }
  return res.json()
}

export async function uploadProfilePhoto(file: File): Promise<{ url: string }> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetchWithAuth(`${API}/upload-photo`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Ошибка загрузки: ${res.status}`)
  }
  return res.json()
}
