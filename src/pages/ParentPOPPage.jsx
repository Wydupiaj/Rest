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
  Divider
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={() => navigate('/component-order')}>
          ← Back to Orders
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom>
        Building info for POP
      </Typography>

      {/* Parent POP Information - Red Border */}
      <Paper sx={{ p: 3, mb: 3, border: '3px solid #d32f2f' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          POP information
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography><strong>POP STATUS:</strong> {convertedParentPop.popStatus}</Typography>
            <Typography><strong>POP Type:</strong> {convertedParentPop.popType}</Typography>
            <Typography><strong>Pop id:</strong> {convertedParentPop.popId}</Typography>
            <Typography><strong>POP type:</strong> {convertedParentPop.popTypeDesc}</Typography>
            <Typography><strong>Material produced:</strong> {convertedParentPop.materialProduced || orderData.material}</Typography>
            <Typography><strong>Quantity:</strong> {convertedParentPop.quantity || orderData.qty}</Typography>
            
            {/* Co-Products Section */}
            {orderData.coProducts && orderData.coProducts.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {orderData.coProducts.map((coProduct, index) => (
                  <Box key={index}>
                    <Typography>
                      <strong>{index + 1} Co-Product number:</strong> {coProduct.number || coProduct.product_number}
                    </Typography>
                    <Typography>
                      <strong>{index + 1} Co-Product description:</strong> {coProduct.description}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Last registration point was <strong>{convertedParentPop.registrationCode}</strong> - {convertedParentPop.registrationDesc} on{' '}
              <strong>{convertedParentPop.timestamp}</strong>
            </Typography>
            <Typography variant="body2">
              Last modified by <strong>YSERYRAN</strong> on <strong>January 15, 2026 at 9:49:46 AM GMT+0</strong>
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography><strong>Order info:</strong> {orderData.orderId}</Typography>
            <Typography><strong>Body type:</strong></Typography>
            <Typography><strong>Model year:</strong> 99</Typography>
            <Typography><strong>RFID:</strong></Typography>
            <Divider sx={{ my: 1 }} />
            <Typography><strong>Order id:</strong> {orderData.orderId}</Typography>
            <Typography><strong>Vendor code:</strong> AEMR7</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography><strong>Product id:</strong> {orderData.materialDesc}</Typography>
            <Typography><strong>Test pop:</strong> false</Typography>
            <Typography>
              <strong>GR message sent at:</strong> November 3, 2025 at 9:43:59 AM GMT+0
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs Section */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Serials" />
          <Tab label="Production Parameters" />
          <Tab label="Consumed Materials" />
        </Tabs>
      </Box>

      {/* Child POPs Table - Green Border */}
      <TabPanel value={tabValue} index={0}>
        <Paper sx={{ border: '3px solid #2e7d32', p: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Related Child POP's
          </Typography>
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={childPops}
              columns={childPopColumns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell': { fontSize: '0.875rem' },
                '& .MuiDataGrid-columnHeaders': { fontWeight: 'bold' }
              }}
            />
          </Box>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 2, height: 500 }}>
          <DataGrid
            rows={convertedParams}
            columns={productionParamColumns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
          />
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 2, height: 500 }}>
          <DataGrid
            rows={convertedMaterials}
            columns={consumedMaterialColumns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
          />
        </Paper>
      </TabPanel>
    </Box>
  )
}
