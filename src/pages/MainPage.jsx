import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActionArea from '@mui/material/CardActionArea'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import { useNavigate } from 'react-router-dom'

export default function MainPage() {
  const navigate = useNavigate()

  const pages = [
    {
      title: 'Component Order',
      description: 'Manage and track component orders',
      path: '/component-order',
      color: '#1976d2'
    },
    {
      title: 'Page 2',
      description: 'Coming soon',
      path: '/page2',
      color: '#388e3c'
    },
    {
      title: 'Page 3',
      description: 'Coming soon',
      path: '/page3',
      color: '#d32f2f'
    }
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pt: 8, pb: 6 }}>
      <Box sx={{ px: 3, maxWidth: '1200px', mx: 'auto' }}>
        <Typography variant="h3" sx={{ mb: 6, textAlign: 'center', fontWeight: 'bold' }}>
          Dashboard
        </Typography>
        
        <Grid container spacing={4} justifyContent="center">
          {pages.map((page) => (
            <Grid item xs={12} sm={6} md={4} key={page.path}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardActionArea 
                  onClick={() => navigate(page.path)}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                >
                  <Box
                    sx={{
                      height: '140px',
                      background: `linear-gradient(135deg, ${page.color}20 0%, ${page.color}10 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderBottom: `4px solid ${page.color}`
                    }}
                  >
                    <Typography variant="h5" sx={{ color: page.color, fontWeight: 'bold' }}>
                      📊
                    </Typography>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="h6" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {page.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {page.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}
