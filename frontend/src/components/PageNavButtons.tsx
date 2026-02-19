import { Link } from 'react-router-dom'
import './PageNavButtons.css'

export default function PageNavButtons() {
  const openMenu = () => {
    window.dispatchEvent(new CustomEvent('openSidebar'))
  }

  return (
    <nav className="page-nav-buttons">
      <Link to="/" className="page-nav-btn">
        О себе
      </Link>
      <button type="button" className="page-nav-btn" onClick={openMenu}>
        Меню
      </button>
    </nav>
  )
}
