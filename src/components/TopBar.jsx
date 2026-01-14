
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useNavigate, useLocation } from 'react-router-dom'

export default function TopBar(){
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <AppBar position="sticky" elevation={0} color="default" sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
      <Toolbar>
        {location.pathname !== '/' && (
          <Button 
            color="inherit" 
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            ← Back
          </Button>
        )}
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {location.pathname === '/' ? 'Dashboard' : 'Component Order'}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant="body2" color="text.secondary">Demo</Typography>
      </Toolbar>
    </AppBar>
  )
}
