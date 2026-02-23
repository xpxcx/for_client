import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import ContentPage from './pages/ContentPage/ContentPage'
import NewsPage from './pages/NewsPage/NewsPage'
import ContactPage from './pages/ContactPage/ContactPage'
import AchievementsPage from './pages/AchievementsPage/AchievementsPage'
import MaterialsPage from './pages/MaterialsPage/MaterialsPage'
import LoginPage from './pages/LoginPage/LoginPage'
import RegisterPage from './pages/RegisterPage/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage'
import CabinetLayout from './pages/cabinet/CabinetLayout/CabinetLayout'
import CabinetProfilePage from './pages/cabinet/CabinetProfilePage/CabinetProfilePage'
import CabinetManagePage from './pages/cabinet/CabinetManagePage/CabinetManagePage'
import CabinetMaterialsPage from './pages/cabinet/CabinetMaterialsPage/CabinetMaterialsPage'
import CabinetNewsPage from './pages/cabinet/CabinetNewsPage/CabinetNewsPage'
import CabinetLinksPage from './pages/cabinet/CabinetLinksPage/CabinetLinksPage'
import CabinetContactInfoPage from './pages/cabinet/CabinetContactInfoPage/CabinetContactInfoPage'
import './App.css'
import './AboutSection.css'
import './Accessibility.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ContentPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="materials" element={<MaterialsPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route
            path="cabinet"
            element={
              <ProtectedRoute>
                <CabinetLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="contacts" element={<Navigate to="/cabinet/profile" replace />} />
            <Route path="profile" element={<CabinetProfilePage />} />
            <Route
              path="manage"
              element={
                <AdminRoute>
                  <CabinetManagePage />
                </AdminRoute>
              }
            />
            <Route
              path="materials"
              element={
                <AdminRoute>
                  <CabinetMaterialsPage />
                </AdminRoute>
              }
            />
            <Route
              path="news"
              element={
                <AdminRoute>
                  <CabinetNewsPage />
                </AdminRoute>
              }
            />
            <Route
              path="links"
              element={
                <AdminRoute>
                  <CabinetLinksPage />
                </AdminRoute>
              }
            />
            <Route
              path="contact-info"
              element={
                <AdminRoute>
                  <CabinetContactInfoPage />
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
