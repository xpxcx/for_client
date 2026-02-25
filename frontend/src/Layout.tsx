import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, Outlet, useLocation } from 'react-router-dom'
import CookieNotice from './components/CookieNotice'
import AccessibilityToolbar, { type AccessibilityColorScheme, type AccessibilityImagesMode } from './components/AccessibilityToolbar/AccessibilityToolbar'
import { menuKeys, fetchSections, type Section } from './api/menu'
import './Layout.css'
import './DarkTheme.css'

const FALLBACK_SECTIONS: Section[] = [
  { id: 'about', title: 'О себе', path: '/' },
  { id: 'achievements', title: 'Достижения', path: '/achievements' },
  { id: 'materials', title: 'Материалы', path: '/materials' },
  { id: 'news', title: 'Новости', path: '/news' },
  { id: 'contact', title: 'Контакты', path: '/contact' },
  { id: 'links', title: 'Полезные ссылки', path: '/links' },
]

const TITLE_PREFIX = 'Крумова Эльмира Мамедовна, Сургут - '

const PAGE_TITLES: Record<string, string> = {
  '/': `${TITLE_PREFIX}О себе`,
  '/about': `${TITLE_PREFIX}О себе`,
  '/achievements': `${TITLE_PREFIX}Достижения`,
  '/news': `${TITLE_PREFIX}Новости`,
  '/contact': `${TITLE_PREFIX}Контакты`,
  '/materials': `${TITLE_PREFIX}Материалы`,
  '/links': `${TITLE_PREFIX}Полезные ссылки`,
  '/login': `${TITLE_PREFIX}Вход`,
  '/register': `${TITLE_PREFIX}Регистрация`,
  '/forgot-password': `${TITLE_PREFIX}Восстановление пароля`,
  '/reset-password': `${TITLE_PREFIX}Сброс пароля`,
  '/cabinet': `${TITLE_PREFIX}Личный кабинет`,
  '/cabinet/profile': `${TITLE_PREFIX}Профиль`,
  '/cabinet/manage': `${TITLE_PREFIX}Управление достижениями`,
  '/cabinet/materials': `${TITLE_PREFIX}Управление материалами`,
  '/cabinet/news': `${TITLE_PREFIX}Управление новостями`,
  '/cabinet/links': `${TITLE_PREFIX}Управление полезными ссылками`,
  '/cabinet/contact-info': `${TITLE_PREFIX}Контактная информация`,
  '/cabinet/menu': `${TITLE_PREFIX}Управление меню`,
}

const STORAGE_KEY = 'accessibilityMode'
const DARK_THEME_KEY = 'darkTheme'
const ACC_FONT_KEY = 'accessibilityFontSizePt'
const ACC_SCHEME_KEY = 'accessibilityColorScheme'
const ACC_IMAGES_KEY = 'accessibilityImagesMode'

const DEFAULT_FONT_PT = 18

function getStoredAccessibility(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function getStoredDarkTheme(): boolean {
  try {
    return localStorage.getItem(DARK_THEME_KEY) === '1'
  } catch {
    return false
  }
}

function getStoredAccFont(): number {
  try {
    const v = parseInt(localStorage.getItem(ACC_FONT_KEY) ?? '', 10)
    return Number.isFinite(v) && v >= 12 && v <= 24 ? v : DEFAULT_FONT_PT
  } catch {
    return DEFAULT_FONT_PT
  }
}

function getStoredAccScheme(): AccessibilityColorScheme {
  try {
    const v = localStorage.getItem(ACC_SCHEME_KEY) as AccessibilityColorScheme | null
    return v && ['default', 'inverted', 'blue', 'yellow', 'brown'].includes(v) ? v : 'default'
  } catch {
    return 'default'
  }
}

function getStoredAccImages(): AccessibilityImagesMode {
  try {
    const v = localStorage.getItem(ACC_IMAGES_KEY) as AccessibilityImagesMode | null
    return v && ['on', 'off', 'grayscale'].includes(v) ? v : 'on'
  } catch {
    return 'on'
  }
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: sectionsData } = useQuery({ queryKey: menuKeys.list(), queryFn: fetchSections })
  const sections = sectionsData ?? FALLBACK_SECTIONS
  const [accessibilityMode, setAccessibilityMode] = useState(() => getStoredAccessibility())
  const [darkTheme, setDarkTheme] = useState(() => getStoredDarkTheme())
  const [accessibilityFontSizePt, setAccessibilityFontSizePt] = useState(getStoredAccFont)
  const [accessibilityColorScheme, setAccessibilityColorScheme] = useState<AccessibilityColorScheme>(getStoredAccScheme)
  const [accessibilityImagesMode, setAccessibilityImagesMode] = useState<AccessibilityImagesMode>(getStoredAccImages)
  const location = useLocation()

  useEffect(() => {
    try {
      if (accessibilityMode) {
        localStorage.setItem(STORAGE_KEY, '1')
        document.documentElement.classList.add('accessibility-mode')
        document.documentElement.style.setProperty('--accessibility-font-scale', String(accessibilityFontSizePt / DEFAULT_FONT_PT))
        document.documentElement.classList.remove('accessibility-scheme-default', 'accessibility-scheme-inverted', 'accessibility-scheme-blue', 'accessibility-scheme-yellow', 'accessibility-scheme-brown')
        document.documentElement.classList.add(`accessibility-scheme-${accessibilityColorScheme}`)
        document.documentElement.classList.remove('accessibility-images-off', 'accessibility-images-grayscale')
        if (accessibilityImagesMode !== 'on') document.documentElement.classList.add(accessibilityImagesMode === 'off' ? 'accessibility-images-off' : 'accessibility-images-grayscale')
      } else {
        localStorage.removeItem(STORAGE_KEY)
        document.documentElement.classList.remove('accessibility-mode')
        document.documentElement.style.removeProperty('--accessibility-font-scale')
        document.documentElement.classList.remove('accessibility-scheme-default', 'accessibility-scheme-inverted', 'accessibility-scheme-blue', 'accessibility-scheme-yellow', 'accessibility-scheme-brown', 'accessibility-images-off', 'accessibility-images-grayscale')
      }
    } catch { }
  }, [accessibilityMode, accessibilityFontSizePt, accessibilityColorScheme, accessibilityImagesMode])

  useEffect(() => {
    try {
      localStorage.setItem(ACC_FONT_KEY, String(accessibilityFontSizePt))
    } catch { }
  }, [accessibilityFontSizePt])

  useEffect(() => {
    try {
      localStorage.setItem(ACC_SCHEME_KEY, accessibilityColorScheme)
    } catch { }
  }, [accessibilityColorScheme])

  useEffect(() => {
    try {
      localStorage.setItem(ACC_IMAGES_KEY, accessibilityImagesMode)
    } catch { }
  }, [accessibilityImagesMode])

  useEffect(() => {
    try {
      if (darkTheme) {
        localStorage.setItem(DARK_THEME_KEY, '1')
        document.documentElement.classList.add('dark-theme')
      } else {
        localStorage.removeItem(DARK_THEME_KEY)
        document.documentElement.classList.remove('dark-theme')
      }
    } catch { }
  }, [darkTheme])

  useEffect(() => {
    const title = PAGE_TITLES[location.pathname] ?? `${TITLE_PREFIX}Портфолио`
    document.title = title
  }, [location.pathname])


  useEffect(() => {
    const handler = () => setSidebarOpen(true)
    window.addEventListener('openSidebar', handler)
    return () => window.removeEventListener('openSidebar', handler)
  }, [])

  const closeSidebar = () => setSidebarOpen(false)

  const isActive = (s: Section) =>
    location.pathname === s.path || (s.path === '/' && location.pathname === '/')

  const menuToggleBtn = (
    <button
      type="button"
      className="menu-toggle"
      onClick={() => setSidebarOpen((v) => !v)}
      aria-label={sidebarOpen ? 'Закрыть меню' : 'Открыть меню'}
    >
      ☰
    </button>
  )

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : ''} ${accessibilityMode ? 'has-accessibility-toolbar' : ''}`}>
      {menuToggleBtn}

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
          {sections.filter((s) => s.id !== 'home' && s.id !== 'cabinet').map((s) => (
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
        <div className="sidebar-accessibility">
          <button
            type="button"
            className={`sidebar-accessibility-btn ${accessibilityMode ? 'active' : ''}`}
            onClick={() => setAccessibilityMode((v) => !v)}
            aria-pressed={accessibilityMode}
            aria-label={accessibilityMode ? 'Выключить версию для слабовидящих' : 'Включить версию для слабовидящих'}
          >
            Для слабовидящих
          </button>
        </div>
      </aside>

      {accessibilityMode && (
        <AccessibilityToolbar
          fontSizePt={accessibilityFontSizePt}
          onFontSizeChange={setAccessibilityFontSizePt}
          colorScheme={accessibilityColorScheme}
          onColorSchemeChange={setAccessibilityColorScheme}
          imagesMode={accessibilityImagesMode}
          onImagesModeChange={setAccessibilityImagesMode}
        />
      )}

      <header className="header">
        <div className="nav-container">
          <Link to="/" className="logo">
            Сайт Крумовой Э.М.
          </Link>
          <div className="header-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setDarkTheme((v) => !v)}
              aria-label={darkTheme ? 'Включить светлую тему' : 'Включить тёмную тему'}
              title={darkTheme ? 'Светлая тема' : 'Тёмная тема'}
            >
              {darkTheme ? (
                <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
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
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>
      <CookieNotice />
    </div>
  )
}
