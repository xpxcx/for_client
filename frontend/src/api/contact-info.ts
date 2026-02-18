import { fetchWithAuth } from './client'

const API = '/api/contact-info'

export type SocialNetworkItem = {
  name: string
  url: string
}

export type ContactInfo = {
  phone: string | null
  email: string | null
  socialNetworks: SocialNetworkItem[]
}

export const contactInfoKeys = {
  all: ['contact-info'] as const,
  get: () => [...contactInfoKeys.all, 'get'] as const,
}

export async function fetchContactInfo(): Promise<ContactInfo> {
  const res = await fetch(API)
  if (!res.ok) throw new Error(String(res.status))
  return res.json()
}

export async function updateContactInfo(data: Partial<ContactInfo>): Promise<ContactInfo> {
  const res = await fetchWithAuth(API, {
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
