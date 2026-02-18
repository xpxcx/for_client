import { getAuthHeaders, refreshToken, removeToken } from './auth'

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, {
    ...options,
    headers: { ...options.headers, ...getAuthHeaders() },
    credentials: 'include',
  })
  if (res.status === 401) {
    try {
      await refreshToken()
      const retryRes = await fetch(url, {
        ...options,
        headers: { ...options.headers, ...getAuthHeaders() },
        credentials: 'include',
      })
      if (retryRes.status === 401) {
        removeToken()
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.')
      }
      return retryRes
    } catch {
      removeToken()
      throw new Error('Сессия истекла. Пожалуйста, войдите снова.')
    }
  }
  if (res.status === 403) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || 'Недостаточно прав доступа. Требуется роль администратора.')
  }
  return res
}
