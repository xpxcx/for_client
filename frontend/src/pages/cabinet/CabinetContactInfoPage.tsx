import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import type { SocialNetworkItem } from '../../api/contact-info'
import {
  contactInfoKeys,
  fetchContactInfo,
  updateContactInfo,
} from '../../api/contact-info'

export default function CabinetContactInfoPage() {
  const queryClient = useQueryClient()
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [socialNetworks, setSocialNetworks] = useState<SocialNetworkItem[]>([])

  const { data, isLoading, error } = useQuery({
    queryKey: contactInfoKeys.get(),
    queryFn: fetchContactInfo,
  })

  const updateMutation = useMutation({
    mutationFn: updateContactInfo,
    onSuccess: (updated) => {
      queryClient.setQueryData(contactInfoKeys.get(), updated)
      setPhone(updated.phone ?? '')
      setEmail(updated.email ?? '')
      setSocialNetworks(updated.socialNetworks ?? [])
    },
  })

  useEffect(() => {
    if (data) {
      setPhone(data.phone ?? '')
      setEmail(data.email ?? '')
      setSocialNetworks(data.socialNetworks ?? [])
    }
  }, [data])

  const addSocial = () => {
    setSocialNetworks((prev) => [...prev, { name: '', url: '' }])
  }

  const removeSocial = (index: number) => {
    setSocialNetworks((prev) => prev.filter((_, i) => i !== index))
  }

  const updateSocial = (index: number, field: 'name' | 'url', value: string) => {
    setSocialNetworks((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cleaned = socialNetworks.filter((s) => s.name.trim() && s.url.trim())
    updateMutation.mutate({
      phone: phone.trim() || null,
      email: email.trim() || null,
      socialNetworks: cleaned,
    })
  }

  if (isLoading) return <div className="card"><p>Загрузка...</p></div>
  if (error)
    return (
      <div className="card">
        <p className="error">{error instanceof Error ? error.message : 'Ошибка загрузки'}</p>
      </div>
    )

  return (
    <>
      <h2>Настройки страницы контактов</h2>
      <p className="cabinet-hint">
        Телефон, почта и ссылки на социальные сети отображаются на странице «Контакты». Количество соцсетей можно менять.
      </p>
      <div className="card cabinet-form-card">
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="ci-phone">Номер телефона</label>
            <input
              id="ci-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (999) 123-45-67"
            />
          </div>
          <div className="form-group">
            <label htmlFor="ci-email">Почта</label>
            <input
              id="ci-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.ru"
            />
          </div>
          <div className="form-group">
            <div className="contact-info-social-edit-header">
              <label>Социальные сети</label>
              <button type="button" className="btn btn-secondary btn-small" onClick={addSocial}>
                Добавить
              </button>
            </div>
            {socialNetworks.length === 0 ? (
              <p className="form-hint">Нет добавленных ссылок. Нажмите «Добавить».</p>
            ) : (
              <ul className="cabinet-list">
                {socialNetworks.map((sn, index) => (
                  <li key={index} className="cabinet-list-item contact-social-edit-item">
                    <div className="contact-social-edit-fields">
                      <input
                        type="text"
                        value={sn.name}
                        onChange={(e) => updateSocial(index, 'name', e.target.value)}
                        placeholder="Название (например: ВКонтакте)"
                        className="contact-social-edit-name"
                      />
                      <input
                        type="url"
                        value={sn.url}
                        onChange={(e) => updateSocial(index, 'url', e.target.value)}
                        placeholder="https://..."
                        className="contact-social-edit-url"
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-small btn-danger"
                      onClick={() => removeSocial(index)}
                    >
                      Удалить
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
              Сохранить
            </button>
          </div>
          {updateMutation.isSuccess && !updateMutation.isPending && (
            <p className="success">Настройки сохранены.</p>
          )}
          {updateMutation.error && (
            <p className="error">
              {updateMutation.error instanceof Error ? updateMutation.error.message : 'Ошибка'}
            </p>
          )}
        </form>
      </div>
    </>
  )
}
