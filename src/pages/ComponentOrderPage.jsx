import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ComponentOrderTable from '../components/ComponentOrderTable'

export default function ComponentOrderPage() {
  const navigate = useNavigate()

  return (
    <Box sx={{ pt: 3, pb: 6, px: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
        >
          Back to dashboard
        </Button>
        <Typography variant="h5" fontWeight={700}>
          Component Order
        </Typography>
      </Stack>

      <ComponentOrderTable />
    </Box>
  )
}
