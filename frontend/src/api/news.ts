import { fetchWithAuth } from './client'

const API = '/api/news'

export type NewsItem = {
  id: string
  date: string
  title: string
  text: string
  sourceType: string | null
}

export const newsKeys = {
  all: ['news'] as const,
  list: () => [...newsKeys.all, 'list'] as const,
  detail: (id: string) => [...newsKeys.all, 'detail', id] as const,
}

export async function fetchNews(): Promise<NewsItem[]> {
  const res = await fetch(API)
  if (!res.ok) throw new Error(String(res.status))
  return res.json()
}

export async function deleteNews(id: string): Promise<void> {
  const res = await fetchWithAuth(`${API}/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Ошибка: ${res.status}`)
  }
}

export async function syncNews(): Promise<{ success: boolean; created: number }> {
  const res = await fetchWithAuth(`${API}/sync`, { method: 'POST' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Ошибка: ${res.status}`)
  }
  return res.json()
}
