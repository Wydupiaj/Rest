import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { orderAPI } from '../services/api'

export default function BuildStartQueuePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [queues, setQueues] = useState([])

  useEffect(() => {
    fetchQueues()
  }, [])

  const fetchQueues = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await orderAPI.getQueues()
      setQueues(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch queues')
      console.error('Error fetching queues:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleQueueClick = (queue) => {
    navigate(`/build-start-queue/${queue.id}`, { state: { queue } })
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pt: 4, pb: 6 }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Build Start Queue
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Queues Table */}
        <Paper sx={{ p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Queue</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Subassembly</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Equipment location name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Max pops to prestart</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Pop Creation Allowed</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Last modified by</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Last modified date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {queues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} sx={{ textAlign: 'center', py: 4 }}>
                      No queues available
                    </TableCell>
                  </TableRow>
                ) : (
                  queues.map((queue) => (
                    <TableRow
                      key={queue.id}
                      onClick={() => handleQueueClick(queue)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: '#f0f0f0',
                          transition: 'background-color 0.2s'
                        }
                      }}
                    >
                      <TableCell>{queue.id}</TableCell>
                      <TableCell>{queue.description || '-'}</TableCell>
                      <TableCell>{queue.type || '-'}</TableCell>
                      <TableCell>{queue.subassembly || '-'}</TableCell>
                      <TableCell>{queue.equipmentLocationName || '-'}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{queue.items || 0}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{queue.maxPopsToPrestart || 0}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        {queue.popCreationAllowed ? '✓' : '✗'}
                      </TableCell>
                      <TableCell>{queue.lastModifiedBy || '-'}</TableCell>
                      <TableCell>{queue.lastModifiedDate || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  )
}
