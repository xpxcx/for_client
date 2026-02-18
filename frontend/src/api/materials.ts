import { fetchWithAuth } from './client'

const API = '/api/materials'

export type Material = {
  id: string
  title: string
  description: string
  fileUrl?: string
  createdAt: string
}

export const materialsKeys = {
  all: ['materials'] as const,
  list: () => [...materialsKeys.all, 'list'] as const,
  detail: (id: string) => [...materialsKeys.all, 'detail', id] as const,
}

export async function fetchMaterials(): Promise<Material[]> {
  const res = await fetch(API)
  if (!res.ok) throw new Error(String(res.status))
  return res.json()
}

export async function createMaterial(data: {
  title: string
  description: string
  fileUrl?: string
}): Promise<Material> {
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

export async function updateMaterial(
  id: string,
  data: Partial<{ title: string; description: string; fileUrl?: string }>,
): Promise<Material> {
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

export async function deleteMaterial(id: string): Promise<void> {
  const res = await fetchWithAuth(`${API}/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Ошибка: ${res.status}`)
  }
}
