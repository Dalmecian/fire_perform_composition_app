import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PerformersProvider } from './contexts/PerformersContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import PerformersPage from './pages/PerformersPage'
import FormationsPage from './pages/FormationsPage'
import MusicPage from './pages/MusicPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PerformersProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/performers" element={<PerformersPage />} />
            <Route path="/formations" element={<FormationsPage />} />
            <Route path="/music" element={<MusicPage />} />
          </Routes>
        </Layout>
      </Router>
    </PerformersProvider>
  </React.StrictMode>,
)