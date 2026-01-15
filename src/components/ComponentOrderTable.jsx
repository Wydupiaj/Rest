
import * as React from 'react'
import { useState, useEffect } from 'react'
import Paper from '@mui/material/Paper'
import { DataGrid, GridToolbar } from '@mui/x-data-grid'
import StatusChip from './StatusChip'
import RowActions from './RowActions'
import { orderAPI } from '../services/api'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

const columns = [
  { field: 'orderId', headerName: 'Order-ID', width: 140 },
  { field: 'startTime', headerName: 'Start time', width: 180 },
  { field: 'assemblySeq', headerName: 'Product assembly sequence', width: 220 },
  { field: 'material', headerName: 'Material produced', width: 160 },
  { field: 'materialDesc', headerName: 'Material description', width: 220 },
  { field: 'qty', headerName: 'Quantity', width: 120 },
  { field: 'equip', headerName: 'Equipment location name', width: 200 },
  { field: 'orderType', headerName: 'Order type', width: 130 },
  { field: 'status', headerName: 'Status', width: 140, renderCell: (p) => <StatusChip value={p.value} /> },
  { field: 'orderIdentifier', headerName: 'Order identifier', width: 160 },
  { field: 'orderTypeDesc', headerName: 'Order type Description', width: 200 },
  { field: 'pop', headerName: '# POP', width: 100 },
  { field: 'wip', headerName: 'Work in Progress', width: 150 },
  { field: 'completed', headerName: 'Completed', width: 120 },
  { field: 'scrapped', headerName: 'Scrapped', width: 110 },
  { field: 'lastModified', headerName: 'Last modified on', width: 180 },
]

export default function ComponentOrderTable(){
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch orders from API
  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await orderAPI.getAllOrders()
      // Convert snake_case from DB to camelCase for frontend
      const formattedData = data.map((order, index) => ({
        id: order.id || index,
        orderId: order.order_id,
        startTime: order.start_time,
        assemblySeq: order.assembly_seq,
        material: order.material,
        materialDesc: order.material_desc,
        qty: order.qty,
        equip: order.equip,
        orderType: order.order_type,
        orderIdentifier: order.order_identifier,
        orderTypeDesc: order.order_type_desc,
        status: order.status,
        pop: order.pop,
        wip: order.wip,
        completed: order.completed,
        scrapped: order.scrapped,
        lastModified: order.last_modified,
      }))
      setOrders(formattedData)
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Failed to load orders. Make sure the backend server is running on http://localhost:8000')
    } finally {
      setLoading(false)
    }
  }

  const handleOrderInfo = (orderId) => {
    const order = orders.find(o => o.id === orderId)
    const orderIdValue = order?.orderId

    if (!orderIdValue) return

    // Open in new tab
    window.open(`/parent-pop/${orderIdValue}`, '_blank')
  }

  const handleCopyToOrder = (orderId) => {
    console.log('Copy to order:', orderId)
    alert(`Copy to order: ${orderId}`)
  }

  const columnsWithActions = [
    ...columns,
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <RowActions
          orderId={params.row.id}
          onOrderInfo={handleOrderInfo}
          onCopyToOrder={handleCopyToOrder}
        />
      ),
    },
  ]

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          ⚠️ {error}
        </Alert>
      )}

      <Paper elevation={0} sx={{ height: 720, width: '100%', border: (t)=>`1px solid ${t.palette.divider}`, position: 'relative' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={orders}
            columns={columnsWithActions}
            getRowId={(r)=>r.id}
            pageSizeOptions={[25,50,100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 50, page: 0 } },
              sorting: { sortModel: [{ field: 'startTime', sort: 'desc' }] }
            }}
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            density="compact"
          />
        )}
      </Paper>
    </>
  )
}
