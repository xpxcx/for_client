import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import HomePage from './pages/HomePage'
import ContentPage from './pages/ContentPage'
import NewsPage from './pages/NewsPage'
import ContactPage from './pages/ContactPage'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path=":id" element={<ContentPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
