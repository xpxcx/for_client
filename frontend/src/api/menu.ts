import { fetchWithAuth } from './client'

const API = '/api/content'

export async function uploadSectionItemFile(file: File): Promise<{ fileUrl: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetchWithAuth(`${API}/section-upload`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Ошибка загрузки: ${res.status}`)
  }
  return res.json()
}

export type Section = {
  id: string
  title: string
  path: string
  description?: string
}

export const menuKeys = {
  all: ['menu'] as const,
  list: () => [...menuKeys.all, 'list'] as const,
}

export async function fetchSections(): Promise<Section[]> {
  const res = await fetch(`${API}/sections`)
  if (!res.ok) throw new Error(String(res.status))
  return res.json()
}

export async function updateSections(sections: Section[]): Promise<Section[]> {
  const res = await fetchWithAuth(`${API}/sections`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sections }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Ошибка: ${res.status}`)
  }
  return res.json()
}

export type SectionItem = {
  id: string
  title: string
  description?: string
  link?: string
}

export const sectionItemsKeys = {
  all: ['sectionItems'] as const,
  list: (sectionId: string) => [...sectionItemsKeys.all, sectionId] as const,
}

export async function fetchSectionItems(sectionId: string): Promise<SectionItem[]> {
  const res = await fetch(`${API}/section/${sectionId}/items`)
  if (!res.ok) throw new Error(String(res.status))
  return res.json()
}

export async function createSectionItem(
  sectionId: string,
  data: { title: string; description?: string; link?: string }
): Promise<SectionItem> {
  const res = await fetchWithAuth(`${API}/section/${sectionId}/items`, {
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

export async function updateSectionItem(
  sectionId: string,
  itemId: string,
  data: { title?: string; description?: string; link?: string }
): Promise<SectionItem> {
  const res = await fetchWithAuth(`${API}/section/${sectionId}/items/${itemId}`, {
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

export async function deleteSectionItem(sectionId: string, itemId: string): Promise<void> {
  const res = await fetchWithAuth(`${API}/section/${sectionId}/items/${itemId}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Ошибка: ${res.status}`)
  }
}
