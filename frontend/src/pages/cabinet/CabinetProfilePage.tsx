import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getProfile, updateProfile, logout, getAllUsers, updateUserRole, isAdmin } from '../../api/auth'

export default function CabinetProfilePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const admin = isAdmin()
  const [showAllUsers, setShowAllUsers] = useState(false)
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  })
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
    enabled: admin,
  })
  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  })
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: 'user' | 'admin' }) => updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fullName = (form.elements.namedItem('fullName') as HTMLInputElement).value.trim() || null
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim() || null
    updateMutation.mutate({ fullName, email })
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Ошибка выхода:', err)
    }
    navigate('/login')
  }

  if (isLoading) {
    return (
      <div className="card">
        <p>Загрузка...</p>
      </div>
    )
  }
  if (error || !profile) {
    return (
      <div className="card">
        <p className="error">{error instanceof Error ? error.message : 'Ошибка загрузки профиля'}</p>
      </div>
    )
  }

  return (
    <div className="card cabinet-form-card">
      <h2>Информация о профиле</h2>
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="profile-fullName">ФИО</label>
          <input
            id="profile-fullName"
            name="fullName"
            type="text"
            defaultValue={profile.fullName ?? ''}
            placeholder="Введите ФИО"
          />
        </div>
        <div className="form-group">
          <label htmlFor="profile-email">Электронная почта</label>
          <input
            id="profile-email"
            name="email"
            type="email"
            defaultValue={profile.email ?? ''}
            placeholder="example@mail.ru"
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn" disabled={updateMutation.isPending}>
            Сохранить
          </button>
          <button type="button" className="btn cabinet-logout" onClick={handleLogout}>
            Выйти
          </button>
        </div>
        {updateMutation.isSuccess && <p className="success">Данные сохранены.</p>}
        {updateMutation.error && (
          <p className="error">
            {updateMutation.error instanceof Error ? updateMutation.error.message : 'Ошибка сохранения'}
          </p>
        )}
      </form>

      {admin && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Управление пользователями</h3>
          {usersLoading ? (
            <p>Загрузка пользователей...</p>
          ) : users && users.length > 0 ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(showAllUsers ? users : users.slice(0, 3)).map((user) => (
                  <div
                    key={user.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: '#fff',
                      borderRadius: '8px',
                      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    <span style={{ fontWeight: user.role === 'admin' ? 500 : 400 }}>
                      {user.fullName || `Пользователь #${user.id}`}
                      {user.role === 'admin' && (
                        <span style={{ marginLeft: '0.5rem', color: '#3498db', fontSize: '0.875rem' }}>(админ)</span>
                      )}
                    </span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={user.role === 'admin'}
                        onChange={(e) => {
                          updateRoleMutation.mutate({
                            userId: user.id,
                            role: e.target.checked ? 'admin' : 'user',
                          })
                        }}
                        disabled={updateRoleMutation.isPending}
                      />
                      <span style={{ fontSize: '0.875rem' }}>Администратор</span>
                    </label>
                  </div>
                ))}
              </div>
              {users.length > 3 && (
                <button
                  type="button"
                  className="btn btn-show-more"
                  onClick={() => setShowAllUsers(!showAllUsers)}
                  style={{ marginTop: '1rem' }}
                >
                  <span>{showAllUsers ? 'Скрыть' : 'Показать больше'}</span>
                  <svg
                    className={`show-more-icon ${showAllUsers ? 'rotated' : ''}`}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              )}
            </>
          ) : (
            <p>Пользователи не найдены</p>
          )}
          {updateRoleMutation.isSuccess && <p className="success" style={{ marginTop: '0.5rem' }}>Роль изменена.</p>}
          {updateRoleMutation.error && (
            <p className="error" style={{ marginTop: '0.5rem' }}>
              {updateRoleMutation.error instanceof Error ? updateRoleMutation.error.message : 'Ошибка изменения роли'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
