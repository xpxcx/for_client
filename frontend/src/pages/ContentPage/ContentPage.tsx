import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useLocation, Link } from 'react-router-dom'
import PageNavButtons from '../../components/PageNavButtons'
import Pagination, { PAGE_SIZE } from '../../components/Pagination'
import { fetchLinks, linksKeys } from '../../api/links'
import { menuKeys, fetchSections, fetchSectionItems, sectionItemsKeys } from '../../api/menu'
import './ContentPage.css'

const API = '/api/content'

const ABOUT_SECTION_HEADERS = /(Личные качества:|Профессиональные качества:|Компьютерные навыки:)/g

function renderAboutBody(body: string): ReactElement {
  const raw = (body ?? '').trim()
  if (!raw) return <p className="about-body-text" />

  let structured: { title: string; description: string }[] | null = null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed) && parsed.length > 0) {
      structured = parsed.map((x: Record<string, unknown>) => ({
        title: String(x.title ?? ''),
        description: String(x.description ?? ''),
      }))
    }
  } catch {
    //
  }

  if (structured && structured.length > 0) {
    return (
      <div className="about-body-sections">
        {structured.map((item, i) => (
          <div key={i} className="about-body-section">
            {item.title.trim() && <span className="about-body-label">{item.title}</span>}
            <span className="about-body-text">{item.description}</span>
          </div>
        ))}
      </div>
    )
  }

  const parts = raw.split(ABOUT_SECTION_HEADERS)
  const intro = parts[0].trim()
  const sections: { label: string; content: string }[] = []
  for (let i = 1; i < parts.length; i += 2) {
    if (parts[i] && parts[i + 1] !== undefined) {
      sections.push({ label: parts[i].trim(), content: parts[i + 1].trim() })
    }
  }

  if (sections.length === 0) {
    return <p className="about-body-text">{raw}</p>
  }

  return (
    <div className="about-body-sections">
      {intro && <p className="about-body-intro">{intro}</p>}
      {sections.map(({ label, content }) => (
        <div key={label} className="about-body-section">
          <span className="about-body-label">{label}</span>
          <span className="about-body-text">{content}</span>
        </div>
      ))}
    </div>
  )
}

function renderAboutListItem(item: string): ReactElement {
  const idx = item.indexOf(': ')
  if (idx > 0 && idx < 80) {
    const label = item.slice(0, idx + 1)
    const content = item.slice(idx + 2).trim()
    return (
      <>
        <span className="about-body-label">{label}</span>
        <span className="about-body-text">{content}</span>
      </>
    )
  }
  return <span className="about-body-text">{item}</span>
}

interface Content {
  id: string
  title: string
  body: string
  fullName?: string
  birthDate?: string
  imageUrl?: string
  education?: string
  experience?: string
}

export default function ContentPage() {
  const { id: paramId } = useParams<{ id: string }>()
  const location = useLocation()
  const id = paramId ?? (location.pathname === '/' ? 'about' : null)
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [linksPage, setLinksPage] = useState(1)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    fetch(`${API}/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setContent(data)
      })
      .catch(() => setError('Раздел не найден'))
      .finally(() => setLoading(false))
  }, [id])

  const { data: linksList = [], isLoading: linksLoading, error: linksError } = useQuery({
    queryKey: linksKeys.list(),
    queryFn: fetchLinks,
    enabled: id === 'links',
  })

  const { data: sections = [] } = useQuery({
    queryKey: menuKeys.list(),
    queryFn: fetchSections,
  })

  const pathNorm = (location.pathname || '/').replace(/\/$/, '') || '/'
  const sectionByPath = sections.find((s) => (s.path.replace(/\/$/, '') || '/') === pathNorm)

  const { data: sectionItems = [] } = useQuery({
    queryKey: sectionItemsKeys.list(sectionByPath?.id ?? ''),
    queryFn: () => fetchSectionItems(sectionByPath!.id),
    enabled: !!sectionByPath?.id && !content,
  })

  if (loading) return <section className="page"><div className="card"><p>Загрузка...</p></div></section>
  if (error || !content) {
    if (sectionByPath) {
      return (
        <section className="page content-page">
          <h1>{sectionByPath.title}</h1>
          {sectionByPath.description && (
            <p className="content-page-intro">{sectionByPath.description}</p>
          )}
          {sectionItems.length > 0 && (
            <div className="content-section-items materials-list">
              {sectionItems.map((item) => (
                <article key={item.id} className="card material-card">
                  <div className="material-info-item">
                    <span className="material-info-label">Название</span>
                    <span className="material-info-value material-info-title">{item.title}</span>
                  </div>
                  {item.description && (
                    <div className="material-info-item">
                      <span className="material-info-label">Описание</span>
                      <p className="material-info-desc">{item.description}</p>
                    </div>
                  )}
                  {item.link && (
                    <div className="material-info-item">
                      <span className="material-info-label">Ссылка</span>
                      <a href={item.link} target="_blank" rel="noreferrer" className="material-info-link">
                        Открыть
                      </a>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
          <PageNavButtons />
        </section>
      )
    }
    return <section className="page"><div className="card"><p className="error">{error}</p></div></section>
  }

  if (id === 'about') {
    return (
      <section className="page content-page about-block">
        <nav className="about-block-nav">
          {sections
            .filter((s) => s.id !== 'home' && s.id !== 'cabinet' && s.id !== 'about')
            .map((s) => (
              <Link key={s.id} to={s.path} className="about-block-nav-link">
                {s.title}
              </Link>
            ))}
          <button
            type="button"
            className="about-block-nav-link"
            onClick={() => window.dispatchEvent(new CustomEvent('openSidebar'))}
          >
            Меню
          </button>
        </nav>
        <h1 className="about-block-title">{content.title}</h1>
        <div className="about-block-inner card">
          <div className="about-photo">
            {content.imageUrl ? (
              <img src={content.imageUrl} alt="" />
            ) : (
              <div className="about-photo-placeholder">Фото</div>
            )}
          </div>
          <div className="about-right">
            {(content.fullName || content.birthDate) && (
              <div className="about-fio-block">
                {content.fullName && <h2 className="about-fio">{content.fullName}</h2>}
                {content.birthDate && <p className="about-birth-date">Дата рождения: {content.birthDate}</p>}
              </div>
            )}
            {(() => {
              const raw = (content.education ?? '').trim()
              if (!raw) return null
              let structured: { institution: string; document: string; qualification?: string }[] | null = null
              try {
                const parsed = JSON.parse(raw) as unknown
                if (Array.isArray(parsed) && parsed.length > 0) {
                  structured = parsed.map((x: Record<string, unknown>) => ({
                    institution: String(x.institution ?? ''),
                    document: String(x.document ?? ''),
                    qualification: x.qualification != null ? String(x.qualification) : undefined,
                  }))
                }
              } catch {
                //
              }
              if (structured && structured.length > 0) {
                return (
                  <div className="about-section">
                    <h3>Образование</h3>
                    <ul className="about-education-list about-experience-list">
                      {structured.map((item, i) => (
                        <li key={i} className="about-experience-item">
                          <span className="about-body-label">Учреждение:</span>
                          <span className="about-body-text">{item.institution}</span>
                          <span className="about-body-label">Документ:</span>
                          <span className="about-body-text">{item.document}</span>
                          {item.qualification != null && item.qualification.trim() !== '' && (
                            <>
                              <span className="about-body-label">Квалификация:</span>
                              <span className="about-body-text">{item.qualification}</span>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              }
              const legacyItems = raw.includes('\n|\n') ? raw.split(/\n\|\n/).map((s) => s.trim()).filter(Boolean) : raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
              if (legacyItems.length === 0) return null
              return (
                <div className="about-section">
                  <h3>Образование</h3>
                  <ul className="about-education-list">
                    {legacyItems.map((item, i) => (
                      <li key={i} className="about-education-item">{renderAboutListItem(item)}</li>
                    ))}
                  </ul>
                </div>
              )
            })()}
            {(() => {
              const raw = (content.experience ?? '').trim()
              if (!raw) return null
              let structured: { placeOfWork: string; position: string; period?: string }[] | null = null
              try {
                const parsed = JSON.parse(raw) as unknown
                if (Array.isArray(parsed) && parsed.length > 0) {
                  structured = parsed.map((x: Record<string, unknown>) => ({
                    placeOfWork: String(x.placeOfWork ?? x.institution ?? ''),
                    position: String(x.position ?? x.document ?? ''),
                    period: x.period != null || x.qualification != null ? String(x.period ?? x.qualification ?? '') : undefined,
                  }))
                }
              } catch {
                //
              }
              if (structured && structured.length > 0) {
                return (
                  <div className="about-section">
                    <h3>Опыт работы</h3>
                    <ul className="about-education-list about-experience-list">
                      {structured.map((item, i) => (
                        <li key={i} className="about-experience-item">
                          <span className="about-body-label">Место работы:</span>
                          <span className="about-body-text">{item.placeOfWork}</span>
                          <span className="about-body-label">Должность:</span>
                          <span className="about-body-text">{item.position}</span>
                          {item.period != null && item.period.trim() !== '' && (
                            <>
                              <span className="about-body-label">Период работы:</span>
                              <span className="about-body-text">{item.period}</span>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              }
              const legacyItems = raw.includes('\n|\n') ? raw.split(/\n\|\n/).map((s) => s.trim()).filter(Boolean) : raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
              if (legacyItems.length === 0) return null
              return (
                <div className="about-section">
                  <h3>Опыт работы</h3>
                  <ul className="about-education-list">
                    {legacyItems.map((item, i) => (
                      <li key={i} className="about-education-item">{renderAboutListItem(item)}</li>
                    ))}
                  </ul>
                </div>
              )
            })()}
            <div className="about-section">
              <h3>О себе</h3>
              {renderAboutBody(content.body)}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (id === 'links') {
    return (
      <section className="page content-page links-page">
        <h1>{content.title}</h1>
        {content.body && <p className="content-page-intro">{content.body}</p>}
        {linksLoading && <div className="card"><p>Загрузка ссылок...</p></div>}
        {linksError && (
          <div className="card">
            <p className="error">{linksError instanceof Error ? linksError.message : 'Не удалось загрузить ссылки'}</p>
          </div>
        )}
        {!linksLoading && !linksError && linksList.length > 0 && (() => {
          const total = linksList.length
          const from = (linksPage - 1) * PAGE_SIZE
          const pageLinks = linksList.slice(from, from + PAGE_SIZE)
          return (
            <>
              <ul className="links-list">
                {pageLinks.map((link) => (
                  <li key={link.id} className="links-list-item">
                    <a href={link.url} target="_blank" rel="noreferrer" className="links-list-title">
                      {link.title}
                    </a>
                    {link.description && <p className="links-list-desc">{link.description}</p>}
                  </li>
                ))}
              </ul>
              <Pagination totalItems={total} currentPage={linksPage} onPageChange={setLinksPage} />
            </>
          )
        })()}
        <PageNavButtons />
      </section>
    )
  }

  return (
    <section className="page content-page">
      <h1>{content.title}</h1>
      {content.body && <p className="content-page-intro">{content.body}</p>}
      <PageNavButtons />
    </section>
  )
}
