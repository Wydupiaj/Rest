import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { orderAPI } from '../services/api'

const parentPopColumns = [
  { field: 'popId', headerName: 'Pop ID', width: 130 },
  { field: 'orderId', headerName: 'Order ID', width: 130 },
  { field: 'materialProduced', headerName: 'Material Produced', width: 180 },
  { field: 'quantity', headerName: 'Quantity', width: 120 },
  { field: 'popStatus', headerName: 'Status', width: 130 },
  { field: 'partNumber', headerName: 'Part Number', width: 150 },
  { field: 'description', headerName: 'Description', width: 200 },
  { field: 'serialNumber', headerName: 'Serial Number', width: 140 },
  { field: 'timestamp', headerName: 'Timestamp', width: 180 },
]

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ marginTop: 16 }}>
      {value === index && children}
    </div>
  )
}

export default function QueueDetailPage() {
  const { queueId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const queue = location.state?.queue
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [parentPops, setParentPops] = useState([])
  const [tabValue, setTabValue] = useState(0)
  const [selectionModel, setSelectionModel] = useState([])

  useEffect(() => {
    fetchParentPops()
  }, [])

  const fetchParentPops = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch all orders and filter parent POPs not completed
      const data = await orderAPI.getQueueParentPops(queueId)
      
      // Transform data for DataGrid
      const transformedPops = data.map((pop) => ({
        id: pop.popId,
        popId: pop.popId,
        orderId: pop.orderId,
        materialProduced: pop.materialProduced,
        quantity: pop.quantity,
        popStatus: pop.popStatus,
        partNumber: pop.partNumber,
        description: pop.description,
        serialNumber: pop.serialNumber,
        timestamp: pop.timestamp,
        batchCompleted: pop.batchCompleted,
      }))
      
      setParentPops(transformedPops)
    } catch (err) {
      setError(err.message || 'Failed to fetch parent POPs')
      console.error('Error fetching parent POPs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBatchComplete = async () => {
    if (selectionModel.length === 0) return
    const popId = selectionModel[0]
    try {
      setLoading(true)
      const updated = await orderAPI.markBatchCompleted(queueId, popId)
      setParentPops((prev) => prev.map((p) => p.popId === popId ? { ...p, popStatus: updated.popStatus, batchCompleted: true } : p))
    } catch (err) {
      setError(err.message || 'Failed to mark batch completed')
    } finally {
      setLoading(false)
    }
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
      <Box sx={{ maxWidth: '1400px', mx: 'auto', px: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/build-start-queue')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Queue: {queueId}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            color="primary"
            disabled={selectionModel.length === 0}
            onClick={handleBatchComplete}
          >
            Batch completed
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Queue Details */}
        {queue && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                  Queue ID
                </Typography>
                <Typography variant="body2">{queue.id}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                  Description
                </Typography>
                <Typography variant="body2">{queue.description || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                  Type
                </Typography>
                <Typography variant="body2">{queue.type || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                  Equipment Location
                </Typography>
                <Typography variant="body2">{queue.equipmentLocationName || '-'}</Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={`Parent POPs (${parentPops.length})`} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ height: 500, width: '100%' }}>
              <DataGrid
                rows={parentPops}
                columns={parentPopColumns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                pagination
                disableSelectionOnClick
                checkboxSelection
                selectionModel={selectionModel}
                onSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
              />
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </Box>
  )
}
