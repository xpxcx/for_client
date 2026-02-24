import { Link, Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { isAdmin } from '../../../api/auth'
import { menuKeys, fetchSections, type Section } from '../../../api/menu'
import './CabinetLayout.css'

function getCabinetPath(section: Section): string {
  const map: Record<string, string> = {
    about: '/cabinet/profile',
    achievements: '/cabinet/manage',
    materials: '/cabinet/materials',
    news: '/cabinet/news',
    links: '/cabinet/links',
    contact: '/cabinet/contact-info',
  }
  return map[section.id] ?? `/cabinet/section/${section.id}`
}

const FIXED_ITEMS_AFTER = [
  { path: '/cabinet/contact-info', label: 'Настройки контактов', adminOnly: true },
  { path: '/cabinet/menu', label: 'Управление меню', adminOnly: true },
]

export default function CabinetLayout() {
  const location = useLocation()
  const admin = isAdmin()
  const { data: sections = [] } = useQuery({ queryKey: menuKeys.list(), queryFn: fetchSections })

  const sectionNavItems = sections
    .filter((s) => s.id !== 'home' && s.id !== 'cabinet')
    .map((s) => ({ path: getCabinetPath(s), label: `Управление «${s.title}»`, adminOnly: true }))

  const navItems = [
    { path: '/cabinet/profile', label: 'Управление профилем', adminOnly: false },
    ...sectionNavItems,
    ...FIXED_ITEMS_AFTER,
  ]

  return (
    <section className="page cabinet-page">
      <h1>Личный кабинет</h1>
      <nav className="cabinet-nav">
        <ul className="cabinet-nav-list">
          {navItems
            .filter((item) => (item.path === '/cabinet/profile' ? !admin : true) && (!item.adminOnly || admin))
            .map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      <div className="cabinet-content">
        <Outlet />
      </div>
    </section>
  )
}
