const TOKEN_KEY = 'portfolio_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUserRole(): string | null {
  const token = getToken()
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
    return payload.role || null
  } catch {
    return null
  }
}

export function isAdmin(): boolean {
  return getUserRole() === 'admin'
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

export async function login(username: string, password: string): Promise<{ access_token: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message ?? 'Ошибка входа')
  }
  const data = await res.json()
  setToken(data.access_token)
  return data
}

export async function register(username: string, password: string): Promise<{ access_token: string }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message ?? 'Ошибка регистрации')
  }
  const data = await res.json()
  setToken(data.access_token)
  return data
}

export async function refreshToken(): Promise<string> {
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) {
    removeToken()
    throw new Error('Не удалось обновить токен')
  }
  const data = await res.json()
  setToken(data.access_token)
  return data.access_token
}

export async function logout(): Promise<void> {
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
  })
  removeToken()
  if (!res.ok) {
    throw new Error('Ошибка выхода')
  }
}

export type Profile = { username: string; fullName: string | null; email: string | null }

async function fetchWithRefresh(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, {
    ...options,
    headers: { ...options.headers, ...getAuthHeaders() },
    credentials: 'include',
  })
  if (res.status === 401) {
    try {
      await refreshToken()
      return fetch(url, {
        ...options,
        headers: { ...options.headers, ...getAuthHeaders() },
        credentials: 'include',
      })
    } catch {
      removeToken()
      throw new Error('Сессия истекла')
    }
  }
  return res
}

export async function getProfile(): Promise<Profile> {
  const res = await fetchWithRefresh('/api/auth/profile')
  if (!res.ok) throw new Error('Ошибка загрузки профиля')
  return res.json()
}

export async function updateProfile(data: {
  fullName?: string | null
  email?: string | null
}): Promise<Profile> {
  const res = await fetchWithRefresh('/api/auth/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Ошибка сохранения')
  return res.json()
}

export type UserListItem = { id: number; fullName: string | null; role: string }

export async function getAllUsers(): Promise<UserListItem[]> {
  const res = await fetchWithRefresh('/api/auth/users')
  if (!res.ok) throw new Error('Ошибка загрузки пользователей')
  return res.json()
}

export async function updateUserRole(userId: number, role: 'user' | 'admin'): Promise<UserListItem> {
  const res = await fetchWithRefresh(`/api/auth/users/${userId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || 'Ошибка изменения роли')
  }
  return res.json()
}
