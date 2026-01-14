
import * as React from 'react'
import { useState } from 'react'
import Paper from '@mui/material/Paper'
import { DataGrid, GridToolbar } from '@mui/x-data-grid'
import StatusChip from './StatusChip'
import RowActions from './RowActions'
import OrderInfoDialog from './OrderInfoDialog'
import rows from '../data/sampleOrders'

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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [selectedOrderData, setSelectedOrderData] = useState(null)

  const handleOrderInfo = (orderId) => {
    const orderData = rows.find(row => row.id === orderId)
    setSelectedOrderId(orderId)
    setSelectedOrderData(orderData)
    setDialogOpen(true)
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
      <Paper elevation={0} sx={{ height: 720, width: '100%', border: (t)=>`1px solid ${t.palette.divider}` }}>
        <DataGrid
          rows={rows}
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
      </Paper>
      <OrderInfoDialog
        open={dialogOpen}
        orderId={selectedOrderId}
        orderData={selectedOrderData}
        onClose={() => setDialogOpen(false)}
      />
    </>
  )
}
