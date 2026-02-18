import { fetchWithAuth } from './client'

const API = '/api/links'

export type UsefulLink = {
  id: string
  title: string
  url: string
  description?: string
  createdAt: string
}

export const linksKeys = {
  all: ['links'] as const,
  list: () => [...linksKeys.all, 'list'] as const,
  detail: (id: string) => [...linksKeys.all, 'detail', id] as const,
}

export async function fetchLinks(): Promise<UsefulLink[]> {
  const res = await fetch(API)
  if (!res.ok) throw new Error(String(res.status))
  return res.json()
}

export async function createLink(data: {
  title: string
  url: string
  description?: string
}): Promise<UsefulLink> {
  const res = await fetchWithAuth(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Ошибка: ${res.status}`)
  }
  return res.json()
}

export async function updateLink(
  id: string,
  data: Partial<{ title: string; url: string; description?: string }>,
): Promise<UsefulLink> {
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

export async function deleteLink(id: string): Promise<void> {
  const res = await fetchWithAuth(`${API}/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Ошибка: ${res.status}`)
  }
}
