import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Grid,
  Chip,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { orderAPI } from '../services/api'

const childPopColumns = [
  { field: 'serialNumber', headerName: 'Serial number', width: 130 },
  { field: 'childPopId', headerName: 'Child-POP id:', width: 150 },
  { field: 'partNumber', headerName: 'Part Number', width: 130 },
  { field: 'type', headerName: 'Type', width: 130 },
  { field: 'typeDescription', headerName: 'Type description', width: 200 },
  { field: 'status', headerName: 'Status', width: 130 },
  { field: 'description', headerName: 'Description', width: 200 },
  { field: 'timestamp', headerName: 'Timestamp', width: 180 },
]

const productionParamColumns = [
  { field: 'paramId', headerName: 'Param ID', width: 120 },
  { field: 'parameter', headerName: 'Parameter', width: 150 },
  { field: 'value', headerName: 'Value', width: 120 },
  { field: 'dataType', headerName: 'Data Type', width: 120 },
  { field: 'uom', headerName: 'UOM', width: 100 },
  { field: 'description', headerName: 'Description', width: 200 },
  { field: 'lastModifiedBy', headerName: 'Modified By', width: 150 },
  { field: 'lastModifiedDate', headerName: 'Modified Date', width: 180 },
]

const consumedMaterialColumns = [
  { field: 'materialConsumed', headerName: 'Material', width: 180 },
  { field: 'materialDescription', headerName: 'Description', width: 220 },
  { field: 'segmentId', headerName: 'Segment ID', width: 120 },
  { field: 'equipmentId', headerName: 'Equipment ID', width: 120 },
  { field: 'equipmentLevel', headerName: 'Equipment Level', width: 140 },
  { field: 'quantity', headerName: 'Quantity', width: 120 },
  { field: 'lastModifiedDate', headerName: 'Modified Date', width: 180 },
]

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ marginTop: 16 }}>
      {value === index && children}
    </div>
  )
}

export default function ParentPopPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orderData, setOrderData] = useState(null)
  const [parentPop, setParentPop] = useState(null)
  const [childPops, setChildPops] = useState([])
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    fetchOrderAndPopData()
  }, [orderId])

  const fetchOrderAndPopData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch order details
      const order = await orderAPI.getOrderById(orderId)
      
      // Convert co-products field names
      if (order.coProducts && Array.isArray(order.coProducts)) {
        order.coProducts = order.coProducts.map(cp => ({
          ...cp,
          number: cp.product_number
        }))
      }
      
      setOrderData(order)
      
      // Parent POP is the first (and only) related POP
      // Parent POP is the first related POP
      if (order.relatedPops && order.relatedPops.length > 0) {
        setParentPop(order.relatedPops[0])
      }
        
      // Get child POPs from backend
      if (order.childPops && order.childPops.length > 0) {
        const formattedChildPops = order.childPops.map(childPop => ({
          id: childPop.pop_id || childPop.id,
          serialNumber: childPop.serial_number || childPop.serialNumber || '',
          childPopId: childPop.pop_id || childPop.childPopId,
          partNumber: childPop.part_number || childPop.partNumber,
          type: childPop.pop_type || childPop.type,
          typeDescription: childPop.description || childPop.typeDescription || '',
          status: childPop.pop_status || childPop.status,
          description: childPop.registration_desc || childPop.description || 'N/A',
          timestamp: childPop.timestamp || new Date().toISOString().slice(0, 19).replace('T', ' ')
        }))
        setChildPops(formattedChildPops)
      } else {
        setChildPops([])
      }

      // Ensure orderData has childPops array
      order.childPops = order.childPops || []
      
    } catch (err) {
      console.error('Error fetching order data:', err)
      setError('Failed to load order information')
    } finally {
      setLoading(false)
    }
  }

  const convertData = (data) => {
    if (!data) return data
    const converted = { ...data }
    const fieldMap = {
      serial_number: 'serialNumber',
      pop_id: 'popId',
      material_produced: 'materialProduced',
      pop_type: 'popType',
      pop_type_desc: 'popTypeDesc',
      pop_status: 'popStatus',
      registration_code: 'registrationCode',
      registration_desc: 'registrationDesc',
      param_id: 'paramId',
      data_type: 'dataType',
      last_modified_by: 'lastModifiedBy',
      last_modified_date: 'lastModifiedDate',
      material_consumed: 'materialConsumed',
      material_description: 'materialDescription',
      segment_id: 'segmentId',
      equipment_id: 'equipmentId',
      equipment_level: 'equipmentLevel',
      product_number: 'number'
    }
    
    Object.keys(fieldMap).forEach(oldKey => {
      if (converted[oldKey] !== undefined) {
        converted[fieldMap[oldKey]] = converted[oldKey]
        delete converted[oldKey]
      }
    })
    return converted
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!orderData || !parentPop) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No order data found</Alert>
      </Box>
    )
  }

  const convertedParentPop = convertData(parentPop)
  const convertedParams = (orderData.productionParameters || []).map(convertData)
  const convertedMaterials = (orderData.consumedMaterials || []).map(convertData)

  // Compute parent POP display status (similar to queue detail page)
  let displayStatus = convertedParentPop.popStatus
  if (orderData.status === 'READY' || orderData.status === 'UPDATED') {
    displayStatus = 'Product Created'
  } else if (orderData.status === 'RELEASED') {
    displayStatus = parentPop.batch_completed ? 'Batch Completed' : 'Batch Started'
  } else if (orderData.status === 'COMPLETED') {
    displayStatus = 'Batch Completed'
  }

  const getStatusColor = (status) => {
    if (status === 'Product Created') return 'info'
    if (status === 'Batch Started') return 'warning'
    if (status === 'Batch Completed') return 'success'
    return 'default'
  }

  const handleCompleteOrder = async () => {
    try {
      await orderAPI.completeOrder(orderId)
      // Refresh order data
      const order = await orderAPI.getOrderById(orderId)
      setOrderData(order)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to complete order')
    }
  }

  const handleChildPopScrapped = async (childPopId) => {
    try {
      await orderAPI.markChildPopScrapped(orderId, childPopId)
      // Refresh order data
      const order = await orderAPI.getOrderById(orderId)
      setOrderData(order)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to mark child POP as scrapped')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pt: 4, pb: 6 }}>
      <Box sx={{ maxWidth: '1600px', mx: 'auto', px: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/component-order')}
            sx={{ mr: 2 }}
            variant="outlined"
          >
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
            Parent POP Details - {convertedParentPop.popId}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Parent POP Information Card */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              POP Information
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Order: {orderData.orderId}
            </Typography>
          </Box>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Order Status:</Typography>
            <Chip label={orderData.status} color={orderData.status === 'RELEASED' ? 'warning' : orderData.status === 'COMPLETED' ? 'success' : 'default'} sx={{ height: 28 }} />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Parent POP Status:</Typography>
            <Chip label={displayStatus} color={getStatusColor(displayStatus)} sx={{ fontWeight: 'bold', minWidth: 150, height: 28 }} />
          </Stack>
        </Stack>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 'bold' }}>
                POP ID
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{convertedParentPop.popId}</Typography>

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 'bold' }}>
                Material Produced
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{convertedParentPop.materialProduced || orderData.material || '-'}</Typography>

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 'bold' }}>
                Description
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {orderData.material_desc || orderData.materialDesc || orderData.materialDescription || '-'}
              </Typography>

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 'bold' }}>
                Quantity
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{convertedParentPop.quantity || orderData.qty || '-'}</Typography>

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 'bold' }}>
                Part Number
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{convertedParentPop.partNumber || '-'}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 'bold' }}>
                Order ID
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{orderData.orderId}</Typography>

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 'bold', mt: 1 }}>
                POP Type
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{convertedParentPop.popTypeDesc || '-'}</Typography>

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 'bold' }}>
                Timestamp
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{convertedParentPop.timestamp || '-'}</Typography>
            </Grid>
          </Grid>

          {/* Co-Products Section */}
          {orderData.coProducts && orderData.coProducts.length > 0 && (
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                Co-Products
              </Typography>
              <Stack spacing={2}>
                {orderData.coProducts.map((coProduct, index) => (
                  <Box key={index}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                      Co-Product {index + 1}
                    </Typography>
                    <Typography variant="body2">
                      {coProduct.number || coProduct.product_number} - {coProduct.description}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Paper>

        {/* Tabs for Child POPs, Production Parameters, and Consumed Materials */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
          >
            <Tab label={`Child POPs (${(orderData.childPops || []).length})`} />
            <Tab label={`Production Parameters (${(orderData.productionParameters || []).length})`} />
            <Tab label={`Consumed Materials (${(orderData.consumedMaterials || []).length})`} />
          </Tabs>

          {/* Child POPs Tab */}
          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              {orderData.childPops && orderData.childPops.length > 0 ? (
                <Box sx={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={orderData.childPops.map(cp => ({
                      id: cp.pop_id || cp.id,
                      popId: cp.pop_id,
                      serialNumber: cp.serial_number || cp.serialNumber || '',
                      childPopId: cp.pop_id,
                      partNumber: cp.part_number || '-',
                      type: cp.type || '-',
                      typeDescription: cp.type_description || '-',
                      status: cp.pop_status || '-',
                      description: cp.description || '-',
                      timestamp: cp.timestamp || '-',
                    }))}
                    columns={[
                      { field: 'serialNumber', headerName: 'Serial number', width: 130 },
                      { field: 'childPopId', headerName: 'Child-POP id:', width: 150 },
                      { field: 'partNumber', headerName: 'Part Number', width: 130 },
                      { field: 'type', headerName: 'Type', width: 130 },
                      { field: 'typeDescription', headerName: 'Type description', width: 200 },
                      { field: 'status', headerName: 'Status', width: 130 },
                      { field: 'description', headerName: 'Description', width: 200 },
                      { field: 'timestamp', headerName: 'Timestamp', width: 180 },
                      {
                        field: 'actions',
                        headerName: 'Actions',
                        width: 100,
                        sortable: false,
                        filterable: false,
                        renderCell: (params) => 
                          params.row.status === 'Created' ? (
                            <Tooltip title="Mark as Scrapped">
                              <IconButton
                                size="small"
                                onClick={() => handleChildPopScrapped(params.row.popId)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : null
                      }
                    ]}
                    pageSizeOptions={[5, 10, 25]}
                    sx={{
                      '& .MuiDataGrid-row:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  />
                </Box>
              ) : (
                <Alert severity="info">No child POPs found</Alert>
              )}
            </Box>
          )}

          {/* Production Parameters Tab */}
          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              {orderData.productionParameters && orderData.productionParameters.length > 0 ? (
                <Box sx={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={convertedParams}
                    columns={productionParamColumns}
                    pageSizeOptions={[5, 10, 25]}
                    sx={{
                      '& .MuiDataGrid-row:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  />
                </Box>
              ) : (
                <Alert severity="info">No production parameters found</Alert>
              )}
            </Box>
          )}

          {/* Consumed Materials Tab */}
          {tabValue === 2 && (
            <Box sx={{ p: 3 }}>
              {orderData.consumedMaterials && orderData.consumedMaterials.length > 0 ? (
                <Box sx={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={convertedMaterials}
                    columns={consumedMaterialColumns}
                    pageSizeOptions={[5, 10, 25]}
                    sx={{
                      '& .MuiDataGrid-row:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  />
                </Box>
              ) : (
                <Alert severity="info">No consumed materials found</Alert>
              )}
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Complete Order
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mark this order as completed once all parent and child POP tasks are finished.
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleOutlineIcon />}
              onClick={handleCompleteOrder}
              disabled={orderData.status !== 'RELEASED'}
              sx={{ px: 3, py: 1.2, borderRadius: 2, boxShadow: '0 6px 18px rgba(46, 125, 50, 0.25)', textTransform: 'none', fontWeight: 700 }}
            >
              Complete Order
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  )
}
