import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import { DataGrid, GridToolbar } from '@mui/x-data-grid'
import Paper from '@mui/material/Paper'
import { useState } from 'react'

const popColumns = [
  { field: 'serialNumber', headerName: 'Serial Number', width: 150 },
  { field: 'popId', headerName: 'POP ID', width: 120 },
  { field: 'popType', headerName: 'POP Type', width: 100 },
  { field: 'popTypeDesc', headerName: 'POP Type Description', width: 200 },
  { field: 'popStatus', headerName: 'Status', width: 120 },
  { field: 'registrationCode', headerName: 'Registration Code', width: 150 },
  { field: 'registrationDesc', headerName: 'Registration Description', width: 200 },
  { field: 'timestamp', headerName: 'Timestamp', width: 180 },
]

const paramColumns = [
  { field: 'paramId', headerName: 'Param ID', width: 120 },
  { field: 'parameter', headerName: 'Parameter', width: 150 },
  { field: 'value', headerName: 'Value', width: 120 },
  { field: 'dataType', headerName: 'Data Type', width: 120 },
  { field: 'uom', headerName: 'UOM', width: 100 },
  { field: 'description', headerName: 'Description', width: 200 },
  { field: 'lastModifiedBy', headerName: 'Modified By', width: 150 },
  { field: 'lastModifiedDate', headerName: 'Modified Date', width: 180 },
]

const materialColumns = [
  { field: 'materialConsumed', headerName: 'Material', width: 180 },
  { field: 'materialDescription', headerName: 'Description', width: 220 },
  { field: 'segmentId', headerName: 'Segment ID', width: 120 },
  { field: 'equipmentId', headerName: 'Equipment ID', width: 120 },
  { field: 'equipmentLevel', headerName: 'Equipment Level', width: 140 },
  { field: 'quantity', headerName: 'Quantity', width: 120 },
  { field: 'lastModifiedDate', headerName: 'Modified Date', width: 180 },
]

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

export default function OrderInfoDialog({ open, orderId, orderData, onClose }) {
  const [tabValue, setTabValue] = useState(0)

  const pops = orderData?.relatedPops || []
  const params = orderData?.productionParameters || []
  const materials = orderData?.consumedMaterials || []

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Order Details - {orderId}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="order info tabs">
            <Tab label="Serials (POPs)" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Production Parameters" id="tab-1" aria-controls="tabpanel-1" />
            <Tab label="Consumed Materials" id="tab-2" aria-controls="tabpanel-2" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Paper>
            <DataGrid
              rows={pops}
              columns={popColumns}
              pageSizeOptions={[5, 10]}
              autoHeight
              density="compact"
              slots={{ toolbar: GridToolbar }}
            />
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Paper>
            <DataGrid
              rows={params}
              columns={paramColumns}
              pageSizeOptions={[5, 10]}
              autoHeight
              density="compact"
              slots={{ toolbar: GridToolbar }}
            />
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Paper>
            <DataGrid
              rows={materials}
              columns={materialColumns}
              pageSizeOptions={[5, 10]}
              autoHeight
              density="compact"
              slots={{ toolbar: GridToolbar }}
            />
          </Paper>
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
