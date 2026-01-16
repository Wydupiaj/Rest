
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { CssBaseline } from '@mui/material'
import MainPage from './pages/MainPage'
import ComponentOrderPage from './pages/ComponentOrderPage'
import ParentPopPage from './pages/ParentPopPage'
import BuildStartQueuePage from './pages/BuildStartQueuePage'
import QueueDetailPage from './pages/QueueDetailPage'
import './styles.css'

export default function App(){
  console.log('App rendering')
  return (
    <>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/component-order" element={<ComponentOrderPage />} />
          <Route path="/parent-pop/:orderId" element={<ParentPopPage />} />
          <Route path="/build-start-queue" element={<BuildStartQueuePage />} />
          <Route path="/build-start-queue/:queueId" element={<QueueDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  )
}
