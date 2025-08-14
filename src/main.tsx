import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PerformersProvider } from './contexts/PerformersContext'
import Layout from './components/Layout'
import TimelinePage from './pages/TimelinePage'
import FormationsPage from './pages/FormationsPage'
import MusicPage from './pages/MusicPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PerformersProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<TimelinePage />} />
            <Route path="/formations" element={<FormationsPage />} />
            <Route path="/music" element={<MusicPage />} />
          </Routes>
        </Layout>
      </Router>
    </PerformersProvider>
  </React.StrictMode>,
)