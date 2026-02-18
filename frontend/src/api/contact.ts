import { fetchWithAuth } from './client'

const API = '/api/contact'

export type ContactItem = {
  id: string
  name: string
  email: string
  category?: string
  message: string
  createdAt: string
}

export const contactKeys = {
  all: ['contact'] as const,
  list: () => [...contactKeys.all, 'list'] as const,
  detail: (id: string) => [...contactKeys.all, 'detail', id] as const,
}

export async function fetchContacts(): Promise<ContactItem[]> {
  const res = await fetchWithAuth(API)
  if (!res.ok) throw new Error(String(res.status))
  return res.json()
}

export async function deleteContact(id: string): Promise<void> {
  const res = await fetchWithAuth(`${API}/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Ошибка: ${res.status}`)
  }
}
