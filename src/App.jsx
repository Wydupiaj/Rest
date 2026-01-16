
import Box from '@mui/material/Box'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import theme from './theme'
import TopBar from './components/TopBar'
import MainPage from './pages/MainPage'
import ComponentOrderPage from './pages/ComponentOrderPage'
import ParentPopPage from './pages/ParentPopPage'
import BuildStartQueuePage from './pages/BuildStartQueuePage'
import QueueDetailPage from './pages/QueueDetailPage'
import './styles.css'

export default function App(){
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
          <TopBar />
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/component-order" element={<ComponentOrderPage />} />
            <Route path="/parent-pop/:orderId" element={<ParentPopPage />} />
            <Route path="/build-start-queue" element={<BuildStartQueuePage />} />
            <Route path="/build-start-queue/:queueId" element={<QueueDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  )
}
