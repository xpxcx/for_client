import { fetchWithAuth } from './client'

const API = '/api/achievements'
const UPLOAD_URL = '/api/achievements/upload'

export type Achievement = {
  id: string
  title: string
  description: string
  date: string
  imageUrl?: string
}

export const achievementsKeys = {
  all: ['achievements'] as const,
  lists: () => [...achievementsKeys.all, 'list'] as const,
  list: () => [...achievementsKeys.lists()] as const,
  details: () => [...achievementsKeys.all, 'detail'] as const,
  detail: (id: string) => [...achievementsKeys.details(), id] as const,
}

export async function fetchAchievements(): Promise<Achievement[]> {
  const res = await fetch(API)
  if (!res.ok) throw new Error(String(res.status))
  return res.json()
}

export async function fetchAchievement(id: string): Promise<Achievement> {
  const res = await fetch(`${API}/${id}`)
  if (!res.ok) throw new Error(String(res.status))
  return res.json()
}

export async function uploadImage(file: File): Promise<{ imageUrl: string }> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetchWithAuth(UPLOAD_URL, { method: 'POST', body: fd })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || `Ошибка загрузки: ${res.status}`)
  }
  return res.json()
}

export async function createAchievement(data: {
  title: string
  description: string
  date: string
  imageUrl?: string
}): Promise<Achievement> {
  const res = await fetchWithAuth(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || `Ошибка создания: ${res.status}`)
  }
  return res.json()
}

export async function updateAchievement(
  id: string,
  data: Partial<{ title: string; description: string; date: string; imageUrl?: string }>,
): Promise<Achievement> {
  const res = await fetchWithAuth(`${API}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || `Ошибка обновления: ${res.status}`)
  }
  return res.json()
}

export async function deleteAchievement(id: string): Promise<void> {
  const res = await fetchWithAuth(`${API}/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || `Ошибка удаления: ${res.status}`)
  }
}

export async function deleteAchievementPhoto(id: string): Promise<Achievement> {
  return updateAchievement(id, { imageUrl: undefined })
}
