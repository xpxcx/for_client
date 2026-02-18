import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import './Layout.css'

interface Section {
  id: string
  title: string
  path: string
}

const FALLBACK_SECTIONS: Section[] = [
  { id: 'home', title: 'Главная', path: '/' },
  { id: 'about', title: 'О себе', path: '/about' },
  { id: 'materials', title: 'Материалы', path: '/materials' },
  { id: 'achievements', title: 'Достижения', path: '/achievements' },
  { id: 'news', title: 'Новости', path: '/news' },
  { id: 'contact', title: 'Контакты', path: '/contact' },
  { id: 'links', title: 'Полезные ссылки', path: '/links' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sections, setSections] = useState<Section[]>(FALLBACK_SECTIONS)
  const location = useLocation()

  useEffect(() => {
    fetch('/api/content/sections')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setSections)
      .catch(() => setSections(FALLBACK_SECTIONS))
  }, [])

  const closeSidebar = () => setSidebarOpen(false)

  const isActive = (s: Section) =>
    location.pathname === s.path || (s.path === '/' && location.pathname === '/')

  return (
    <div className="layout">
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
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
