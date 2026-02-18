import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import HomePage from './pages/HomePage'
import ContentPage from './pages/ContentPage'
import NewsPage from './pages/NewsPage'
import ContactPage from './pages/ContactPage'
import AchievementsPage from './pages/AchievementsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CabinetLayout from './pages/cabinet/CabinetLayout'
import CabinetProfilePage from './pages/cabinet/CabinetProfilePage'
import CabinetAddPage from './pages/cabinet/CabinetAddPage'
import CabinetManagePage from './pages/cabinet/CabinetManagePage'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route
            path="cabinet"
            element={
              <ProtectedRoute>
                <CabinetLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<CabinetProfilePage />} />
            <Route
              path="add"
              element={
                <AdminRoute>
                  <CabinetAddPage />
                </AdminRoute>
              }
            />
            <Route
              path="manage"
              element={
                <AdminRoute>
                  <CabinetManagePage />
                </AdminRoute>
              }
            />
          </Route>
          <Route path=":id" element={<ContentPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
