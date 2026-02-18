import { Link, Outlet, useLocation } from 'react-router-dom'
import { isAdmin } from '../../api/auth'
import './CabinetLayout.css'

const CABINET_ITEMS = [
  { path: '/cabinet/profile', label: 'Информация о профиле', adminOnly: false },
  { path: '/cabinet/manage', label: 'Управление достижениями', adminOnly: true },
  { path: '/cabinet/materials', label: 'Управление материалами', adminOnly: true },
  { path: '/cabinet/news', label: 'Управление новостями', adminOnly: true },
  { path: '/cabinet/links', label: 'Управление полезными ссылками', adminOnly: true },
  { path: '/cabinet/contact-info', label: 'Настройки контактов', adminOnly: true },
]

export default function CabinetLayout() {
  const location = useLocation()
  const admin = isAdmin()

  return (
    <section className="page cabinet-page">
      <h1>Личный кабинет</h1>
      <nav className="cabinet-nav">
        <ul className="cabinet-nav-list">
          {CABINET_ITEMS.filter((item) => !item.adminOnly || admin).map((item) => (
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
