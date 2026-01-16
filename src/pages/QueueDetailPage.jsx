import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Switch
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { orderAPI } from '../services/api'

export default function QueueDetailPage() {
  const { queueId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const queue = location.state?.queue
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [parentPops, setParentPops] = useState([])
  const [selectionModel, setSelectionModel] = useState([])

  const parentPopColumns = [
    { field: 'popId', headerName: 'Parent POP ID', width: 150, sortable: true },
    { field: 'orderId', headerName: 'Order ID', width: 130 },
    { field: 'materialProduced', headerName: 'Material', width: 140 },
    { field: 'partNumber', headerName: 'Part Number', width: 140 },
    { field: 'description', headerName: 'Parent POP Description', width: 220 },
    { 
      field: 'popStatus', 
      headerName: 'POP Status', 
      width: 160,
      renderCell: (params) => {
        let color = 'default'
        if (params.value === 'Product Created') color = 'info'
        if (params.value === 'Batch Started') color = 'warning'
        if (params.value === 'Batch Completed') color = 'success'
        return <Chip label={params.value} color={color} size="small" />
      }
    },
    { 
      field: 'locked', 
      headerName: 'Locked', 
      width: 120,
      renderCell: (params) => (
        <Switch
          checked={params.value}
          onChange={(e) => handleLockToggle(params.row.popId, e.target.checked)}
          color="primary"
          onClick={(e) => e.stopPropagation()}
        />
      )
    },
    { field: 'quantity', headerName: 'Quantity', width: 100 },
    { field: 'serialNumber', headerName: 'Serial Number', width: 130 },
    { field: 'timestamp', headerName: 'Timestamp', width: 180 },
  ]

  useEffect(() => {
    fetchParentPops()
  }, [])

  const fetchParentPops = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await orderAPI.getQueueParentPops(queueId)
      
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
        locked: pop.locked,
      }))
      
      setParentPops(transformedPops)
    } catch (err) {
      setError(err.message || 'Failed to fetch parent POPs')
      console.error('Error fetching parent POPs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLockToggle = async (popId, locked) => {
    try {
      await orderAPI.togglePopLocked(queueId, popId, locked)
      setParentPops((prev) => prev.map((p) => 
        p.popId === popId ? { ...p, locked } : p
      ))
    } catch (err) {
      setError(err.message || 'Failed to toggle locked status')
    }
  }

  const handleBatchStarted = async () => {
    if (selectionModel.length === 0) return
    const popId = selectionModel[0]
    try {
      setError(null)
      const updated = await orderAPI.markBatchStarted(queueId, popId)
      setParentPops((prev) => prev.map((p) => 
        p.popId === popId ? { ...p, popStatus: updated.popStatus, batchCompleted: false } : p
      ))
      setSelectionModel([])
    } catch (err) {
      setError(err.message || 'Failed to mark batch started')
    }
  }

  const handleBatchCompleted = async () => {
    if (selectionModel.length === 0) return
    const popId = selectionModel[0]
    try {
      setError(null)
      const updated = await orderAPI.markBatchCompleted(queueId, popId)
      setParentPops((prev) => prev.map((p) => 
        p.popId === popId ? { ...p, popStatus: updated.popStatus, batchCompleted: true } : p
      ))
      setSelectionModel([])
    } catch (err) {
      setError(err.message || 'Failed to mark batch completed')
    }
  }

  const selectedPop = parentPops.find(p => p.popId === selectionModel[0])
  const showBatchStarted = selectedPop?.popStatus === 'Product Created'
  const showBatchCompleted = selectedPop?.popStatus === 'Batch Started'

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pt: 4, pb: 6 }}>
      <Box sx={{ maxWidth: '1600px', mx: 'auto', px: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/build-start-queue')}
            sx={{ mr: 2 }}
            variant="outlined"
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
            Build Start Queue - {queueId}
          </Typography>
          
          <Stack direction="row" spacing={2}>
            {showBatchStarted && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
                onClick={handleBatchStarted}
              >
                Batch Started
              </Button>
            )}
            {showBatchCompleted && (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={handleBatchCompleted}
              >
                Batch Completed
              </Button>
            )}
          </Stack>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Queue Info Card */}
        {queue && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Queue Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 'bold' }}>
                  Description
                </Typography>
                <Typography variant="body2">{queue.description || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 'bold' }}>
                  Type
                </Typography>
                <Typography variant="body2">{queue.type || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 'bold' }}>
                  Subassembly
                </Typography>
                <Typography variant="body2">{queue.subassembly || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 'bold' }}>
                  Equipment Location
                </Typography>
                <Typography variant="body2">{queue.equipmentLocationName || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 'bold' }}>
                  Total Items
                </Typography>
                <Typography variant="body2">{parentPops.length}</Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Parent POPs Table */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Parent POPs ({parentPops.length})
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={parentPops}
                columns={parentPopColumns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50, 100]}
                pagination
                checkboxSelection
                disableMultipleSelection
                selectionModel={selectionModel}
                onSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
                sx={{
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '& .MuiDataGrid-cell:focus': {
                    outline: 'none',
                  },
                }}
              />
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  )
}
