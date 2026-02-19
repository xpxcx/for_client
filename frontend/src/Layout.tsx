import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import CookieNotice from './components/CookieNotice'
import './Layout.css'

interface Section {
  id: string
  title: string
  path: string
}

const FALLBACK_SECTIONS: Section[] = [
  { id: 'about', title: 'О себе', path: '/' },
  { id: 'achievements', title: 'Достижения', path: '/achievements' },
  { id: 'materials', title: 'Материалы', path: '/materials' },
  { id: 'news', title: 'Новости', path: '/news' },
  { id: 'contact', title: 'Контакты', path: '/contact' },
  { id: 'links', title: 'Полезные ссылки', path: '/links' },
]

const PAGE_TITLES: Record<string, string> = {
  '/': 'О себе — Портфолио педагога',
  '/about': 'О себе — Портфолио педагога',
  '/achievements': 'Достижения — Портфолио педагога',
  '/news': 'Новости — Портфолио педагога',
  '/contact': 'Контакты — Портфолио педагога',
  '/materials': 'Материалы — Портфолио педагога',
  '/links': 'Полезные ссылки — Портфолио педагога',
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sections, setSections] = useState<Section[]>(FALLBACK_SECTIONS)
  const location = useLocation()

  useEffect(() => {
    const title = PAGE_TITLES[location.pathname] ?? 'Портфолио педагога'
    document.title = title
  }, [location.pathname])

  useEffect(() => {
    fetch('/api/content/sections')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((list: Section[]) => setSections(list.filter((s) => s.id !== 'home' && s.id !== 'cabinet')))
      .catch(() => setSections(FALLBACK_SECTIONS))
  }, [])

  const closeSidebar = () => setSidebarOpen(false)

  const isActive = (s: Section) =>
    location.pathname === s.path || (s.path === '/' && location.pathname === '/')

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <button
        type="button"
        className="menu-toggle"
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label={sidebarOpen ? 'Закрыть меню' : 'Открыть меню'}
      >
        ☰
      </button>

      <div
        className={`overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={closeSidebar}
        aria-hidden
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Меню</h2>
          <button type="button" className="sidebar-close" onClick={closeSidebar} aria-label="Закрыть">
            ×
          </button>
        </div>
        <ul className="sidebar-menu">
          {sections.map((s) => (
            <li key={s.id}>
              <Link
                to={s.path}
                className={isActive(s) ? 'active' : ''}
                onClick={closeSidebar}
              >
                {s.title}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      <header className="header">
        <div className="nav-container">
          <Link to="/" className="logo">
            Портфолио педагога
          </Link>
          <Link
            to="/cabinet"
            className="cabinet-icon-link"
            aria-label="Личный кабинет"
            title="Личный кабинет"
          >
            <svg className="cabinet-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>
      <CookieNotice />
    </div>
  )
}
