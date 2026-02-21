import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getProfile, updateProfile, logout, getAllUsers, updateUserRole, isAdmin } from '../../../api/auth'
import { fetchContent, updateContent, uploadProfilePhoto, deleteProfilePhoto } from '../../../api/content'
import './CabinetProfilePage.css'

export interface EducationItem {
  institution: string
  document: string
  qualification?: string
}

function parseEducationFromApi(value: string | undefined): EducationItem[] {
  const raw = (value ?? '').trim()
  if (!raw) return [{ institution: '', document: '', qualification: '' }]
  try {
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((x: Record<string, unknown>) => ({
        institution: String(x.institution ?? ''),
        document: String(x.document ?? ''),
        qualification: x.qualification != null ? String(x.qualification) : undefined,
      }))
    }
  } catch {
    //
  }
  const legacy = raw.includes('\n|\n') ? raw.split(/\n\|\n/).map((s) => s.trim()).filter(Boolean) : raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  if (legacy.length) return legacy.map((line) => ({ institution: line, document: '', qualification: undefined }))
  return [{ institution: '', document: '', qualification: '' }]
}

function serializeEducationToApi(items: EducationItem[]): string | undefined {
  const filled = items.filter((i) => i.institution.trim() || i.document.trim())
  if (filled.length === 0) return undefined
  return JSON.stringify(filled.map((i) => ({ institution: i.institution.trim(), document: i.document.trim(), qualification: i.qualification?.trim() || undefined })))
}

export interface ExperienceItem {
  placeOfWork: string
  position: string
  period?: string
}

function parseExperienceFromApi(value: string | undefined): ExperienceItem[] {
  const raw = (value ?? '').trim()
  if (!raw) return [{ placeOfWork: '', position: '', period: '' }]
  try {
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((x: Record<string, unknown>) => ({
        placeOfWork: String(x.placeOfWork ?? x.institution ?? ''),
        position: String(x.position ?? x.document ?? ''),
        period: x.period != null || x.qualification != null ? String(x.period ?? x.qualification ?? '') : undefined,
      }))
    }
  } catch {
    //
  }
  const legacy = raw.includes('\n|\n') ? raw.split(/\n\|\n/).map((s) => s.trim()).filter(Boolean) : raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  if (legacy.length) return legacy.map((line) => ({ placeOfWork: line, position: '', period: undefined }))
  return [{ placeOfWork: '', position: '', period: '' }]
}

function serializeExperienceToApi(items: ExperienceItem[]): string | undefined {
  const filled = items.filter((i) => i.placeOfWork.trim() || i.position.trim())
  if (filled.length === 0) return undefined
  return JSON.stringify(filled.map((i) => ({ placeOfWork: i.placeOfWork.trim(), position: i.position.trim(), period: i.period?.trim() || undefined })))
}

export interface AboutBodyItem {
  title: string
  description: string
}

function parseAboutBodyFromApi(value: string | undefined): AboutBodyItem[] {
  const raw = (value ?? '').trim()
  if (!raw) return [{ title: '', description: '' }]
  try {
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((x: Record<string, unknown>) => ({
        title: String(x.title ?? ''),
        description: String(x.description ?? ''),
      }))
    }
  } catch {
    //
  }
  return [{ title: '', description: raw }]
}

function serializeAboutBodyToApi(items: AboutBodyItem[]): string {
  const filled = items.filter((i) => i.title.trim() || i.description.trim())
  if (filled.length === 0) return ''
  if (filled.length === 1 && !filled[0].title.trim()) return filled[0].description.trim()
  return JSON.stringify(filled.map((i) => ({ title: i.title.trim(), description: i.description.trim() })))
}

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

  const { data: aboutContent } = useQuery({
    queryKey: ['content', 'about'],
    queryFn: () => fetchContent('about'),
    enabled: admin,
  })
  const updateAboutMutation = useMutation({
    mutationFn: (data: {
      title?: string
      body?: string
      fullName?: string
      birthDate?: string
      imageUrl?: string
      education?: string
      experience?: string
    }) => updateContent('about', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['content', 'about'] }),
  })
  const deletePhotoMutation = useMutation({
    mutationFn: () => deleteProfilePhoto('about'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', 'about'] })
      setAboutImageUrl('')
    },
  })
  const [aboutFullName, setAboutFullName] = useState('')
  const [aboutBirthDate, setAboutBirthDate] = useState('')
  const [aboutImageUrl, setAboutImageUrl] = useState('')
  const [aboutEducationItems, setAboutEducationItems] = useState<EducationItem[]>([{ institution: '', document: '', qualification: '' }])
  const [aboutExperienceItems, setAboutExperienceItems] = useState<ExperienceItem[]>([{ placeOfWork: '', position: '', period: '' }])
  const [aboutBodyItems, setAboutBodyItems] = useState<AboutBodyItem[]>([{ title: '', description: '' }])
  const [aboutBodyExpanded, setAboutBodyExpanded] = useState(false)
  const [educationExpanded, setEducationExpanded] = useState(false)
  const [experienceExpanded, setExperienceExpanded] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement | null>(null)
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUploadError(null)
    setPhotoUploading(true)
    uploadProfilePhoto(file)
      .then((data) => {
        setAboutImageUrl(data.url)
        setPhotoUploading(false)
        if (photoInputRef.current) photoInputRef.current.value = ''
      })
      .catch((err) => {
        setPhotoUploadError(err instanceof Error ? err.message : 'Ошибка загрузки')
        setPhotoUploading(false)
      })
  }
  useEffect(() => {
    if (aboutContent) {
      setAboutFullName(aboutContent.fullName ?? '')
      setAboutBirthDate(aboutContent.birthDate ?? '')
      setAboutImageUrl(aboutContent.imageUrl ?? '')
      setAboutEducationItems(parseEducationFromApi(aboutContent.education))
      setAboutExperienceItems(parseExperienceFromApi(aboutContent.experience))
      setAboutBodyItems(parseAboutBodyFromApi(aboutContent.body))
    }
  }, [aboutContent])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fullName = (form.elements.namedItem('fullName') as HTMLInputElement).value.trim() || null
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim() || null
    updateMutation.mutate({ fullName, email })
  }

  const handleLogout = async () => {
    try {
      queryClient.clear()
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
          <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
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
      <div className="card cabinet-form-card" style={{ marginTop: '2rem' }}>
        <h2>Раздел о себе</h2>
        <p className="muted" style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#666' }}>
          Блок отображается на странице «О себе»: слева фото, справа ФИО, опыт работы и текст о себе.
        </p>
        {aboutContent ? (
          <form
            className="contact-form about-edit-form"
            onSubmit={(e) => {
              e.preventDefault()
              updateAboutMutation.mutate({
                fullName: aboutFullName,
                birthDate: aboutBirthDate || undefined,
                imageUrl: aboutImageUrl || undefined,
                education: serializeEducationToApi(aboutEducationItems),
                experience: serializeExperienceToApi(aboutExperienceItems),
                body: serializeAboutBodyToApi(aboutBodyItems),
              })
            }}
          >
            <div className="profile-block-layout">
              <div className="profile-block-photo-col">
                <div className="profile-block-photo">
                  {aboutImageUrl ? (
                    <img src={aboutImageUrl} alt="" />
                  ) : (
                    <div className="profile-block-photo-placeholder">Фото</div>
                  )}
                </div>
                {aboutImageUrl ? (
                  <button
                    type="button"
                    className="btn btn-small btn-danger"
                    onClick={() => {
                      if (confirm('Удалить фотографию?')) {
                        deletePhotoMutation.mutate()
                      }
                    }}
                    disabled={deletePhotoMutation.isPending}
                  >
                    {deletePhotoMutation.isPending ? 'Удаление...' : 'Удалить фото'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn profile-upload-btn"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={photoUploading}
                  >
                    {photoUploading ? 'Загрузка...' : 'Загрузить фото'}
                  </button>
                )}
                <input
                  id="about-photo-upload"
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={photoUploading}
                  style={{ display: 'none' }}
                />
                {photoUploadError && <p className="error profile-upload-error">{photoUploadError}</p>}
              </div>
              <div className="profile-block-right">
                <div className="form-group">
                  <label htmlFor="about-fullName">ФИО</label>
                  <input
                    id="about-fullName"
                    type="text"
                    value={aboutFullName}
                    onChange={(e) => setAboutFullName(e.target.value)}
                    placeholder="Иванов Иван Иванович"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="about-birthDate">Дата рождения</label>
                  <input
                    id="about-birthDate"
                    type="text"
                    value={aboutBirthDate}
                    onChange={(e) => setAboutBirthDate(e.target.value)}
                    placeholder="например: 15.03.1990"
                  />
                </div>
                <div className="form-group education-items-group profile-collapsible-group">
                  <div className="profile-collapsible-header">
                    <label>Образование</label>
                    <button
                      type="button"
                      className="btn btn-collapsible-toggle"
                      onClick={() => setEducationExpanded((v) => !v)}
                    >
                      {educationExpanded ? 'Скрыть' : 'Показать'}
                      <svg
                        className={`profile-collapsible-arrow ${educationExpanded ? 'rotated' : ''}`}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>
                  {educationExpanded && (
                  <>
                  {aboutEducationItems.map((item, index) => (
                    <div key={index} className="experience-item-block">
                      <div className="experience-item-fields">
                        <div className="form-group">
                          <label>Учреждение</label>
                          <input
                            type="text"
                            value={item.institution}
                            onChange={(e) =>
                              setAboutEducationItems((prev) => {
                                const next = [...prev]
                                next[index] = { ...next[index], institution: e.target.value }
                                return next
                              })
                            }
                            placeholder="Название учебного заведения"
                          />
                        </div>
                        <div className="form-group">
                          <label>Документ</label>
                          <input
                            type="text"
                            value={item.document}
                            onChange={(e) =>
                              setAboutEducationItems((prev) => {
                                const next = [...prev]
                                next[index] = { ...next[index], document: e.target.value }
                                return next
                              })
                            }
                            placeholder="Документ об образовании"
                          />
                        </div>
                        <div className="form-group">
                          <label>Квалификация <span className="field-optional">(необязательно)</span></label>
                          <input
                            type="text"
                            value={item.qualification ?? ''}
                            onChange={(e) =>
                              setAboutEducationItems((prev) => {
                                const next = [...prev]
                                next[index] = { ...next[index], qualification: e.target.value || undefined }
                                return next
                              })
                            }
                            placeholder="Квалификация"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-small btn-secondary experience-item-remove"
                        onClick={() =>
                          setAboutEducationItems((prev) =>
                            prev.length <= 1 ? [{ institution: '', document: '', qualification: '' }] : prev.filter((_, i) => i !== index)
                          )
                        }
                        disabled={aboutEducationItems.length <= 1}
                        title="Удалить пункт"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-add-item"
                    onClick={() => setAboutEducationItems((prev) => [...prev, { institution: '', document: '', qualification: '' }])}
                  >
                    Добавить пункт
                  </button>
                  </>
                  )}
                </div>
                <div className="form-group education-items-group profile-collapsible-group">
                  <div className="profile-collapsible-header">
                    <label>Опыт работы</label>
                    <button
                      type="button"
                      className="btn btn-collapsible-toggle"
                      onClick={() => setExperienceExpanded((v) => !v)}
                    >
                      {experienceExpanded ? 'Скрыть' : 'Показать'}
                      <svg
                        className={`profile-collapsible-arrow ${experienceExpanded ? 'rotated' : ''}`}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>
                  {experienceExpanded && (
                  <>
                  {aboutExperienceItems.map((item, index) => (
                    <div key={index} className="experience-item-block">
                      <div className="experience-item-fields">
                        <div className="form-group">
                          <label>Место работы</label>
                          <input
                            type="text"
                            value={item.placeOfWork}
                            onChange={(e) =>
                              setAboutExperienceItems((prev) => {
                                const next = [...prev]
                                next[index] = { ...next[index], placeOfWork: e.target.value }
                                return next
                              })
                            }
                            placeholder="Название организации"
                          />
                        </div>
                        <div className="form-group">
                          <label>Должность</label>
                          <input
                            type="text"
                            value={item.position}
                            onChange={(e) =>
                              setAboutExperienceItems((prev) => {
                                const next = [...prev]
                                next[index] = { ...next[index], position: e.target.value }
                                return next
                              })
                            }
                            placeholder="Должность"
                          />
                        </div>
                        <div className="form-group">
                          <label>Период работы <span className="field-optional">(необязательно)</span></label>
                          <input
                            type="text"
                            value={item.period ?? ''}
                            onChange={(e) =>
                              setAboutExperienceItems((prev) => {
                                const next = [...prev]
                                next[index] = { ...next[index], period: e.target.value || undefined }
                                return next
                              })
                            }
                            placeholder="Например: 2015–2020"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-small btn-secondary experience-item-remove"
                        onClick={() =>
                          setAboutExperienceItems((prev) =>
                            prev.length <= 1 ? [{ placeOfWork: '', position: '', period: '' }] : prev.filter((_, i) => i !== index)
                          )
                        }
                        disabled={aboutExperienceItems.length <= 1}
                        title="Удалить пункт"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-add-item"
                    onClick={() => setAboutExperienceItems((prev) => [...prev, { placeOfWork: '', position: '', period: '' }])}
                  >
                    Добавить пункт
                  </button>
                  </>
                  )}
                </div>
                <div className="form-group education-items-group profile-collapsible-group">
                  <div className="profile-collapsible-header">
                    <label>О себе</label>
                    <button
                      type="button"
                      className="btn btn-collapsible-toggle"
                      onClick={() => setAboutBodyExpanded((v) => !v)}
                    >
                      {aboutBodyExpanded ? 'Скрыть' : 'Показать'}
                      <svg
                        className={`profile-collapsible-arrow ${aboutBodyExpanded ? 'rotated' : ''}`}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>
                  {aboutBodyExpanded && (
                  <>
                  {aboutBodyItems.map((item, index) => (
                    <div key={index} className="experience-item-block">
                      <div className="experience-item-fields">
                        <div className="form-group">
                          <label>Название качества</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) =>
                              setAboutBodyItems((prev) => {
                                const next = [...prev]
                                next[index] = { ...next[index], title: e.target.value }
                                return next
                              })
                            }
                            placeholder="Например: Личные качества"
                          />
                        </div>
                        <div className="form-group">
                          <label>Описание</label>
                          <textarea
                            rows={3}
                            value={item.description}
                            onChange={(e) =>
                              setAboutBodyItems((prev) => {
                                const next = [...prev]
                                next[index] = { ...next[index], description: e.target.value }
                                return next
                              })
                            }
                            placeholder="Текст описания"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-small btn-secondary experience-item-remove"
                        onClick={() =>
                          setAboutBodyItems((prev) =>
                            prev.length <= 1 ? [{ title: '', description: '' }] : prev.filter((_, i) => i !== index)
                          )
                        }
                        disabled={aboutBodyItems.length <= 1}
                        title="Удалить пункт"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-add-item"
                    onClick={() => setAboutBodyItems((prev) => [...prev, { title: '', description: '' }])}
                  >
                    Добавить пункт
                  </button>
                  </>
                  )}
                </div>
                <button type="submit" className="btn btn-save" disabled={updateAboutMutation.isPending}>
                  Сохранить раздел «О себе»
                </button>
                {updateAboutMutation.isSuccess && <p className="success">Раздел «О себе» сохранён.</p>}
                {updateAboutMutation.error && (
                  <p className="error">
                    {updateAboutMutation.error instanceof Error
                      ? updateAboutMutation.error.message
                      : 'Ошибка сохранения'}
                  </p>
                )}
              </div>
            </div>
          </form>
        ) : (
          <p>Загрузка...</p>
        )}
      </div>
      )}

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
