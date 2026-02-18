import { Navigate, useLocation } from 'react-router-dom'
import { getToken, isAdmin } from '../api/auth'

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const token = getToken()
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (!isAdmin()) {
    return <Navigate to="/cabinet/profile" replace />
  }
  return <>{children}</>
}
