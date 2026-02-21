import { Link, useLocation } from 'react-router-dom'
import './PageNavButtons.css'

export default function PageNavButtons() {
  const { pathname } = useLocation()
  const isContactPage = pathname === '/contact'

  const openMenu = () => {
    window.dispatchEvent(new CustomEvent('openSidebar'))
  }

  return (
    <nav className="page-nav-buttons">
      <Link to="/" className="page-nav-btn">
        О себе
      </Link>
      {!isContactPage && (
        <Link to="/contact" className="page-nav-btn">
          Контакты
        </Link>
      )}
      <button type="button" className="page-nav-btn" onClick={openMenu}>
        Меню
      </button>
    </nav>
  )
}
