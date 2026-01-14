import React, { useState } from 'react'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import MoreVertIcon from '@mui/icons-material/MoreVert'

export default function RowActions({ orderId, onOrderInfo, onCopyToOrder }) {
  const [anchorEl, setAnchorEl] = useState(null)

  const handleMenuOpen = (e) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleOrderInfo = () => {
    handleMenuClose()
    onOrderInfo(orderId)
  }

  const handleCopyToOrder = () => {
    handleMenuClose()
    onCopyToOrder(orderId)
  }

  return (
    <>
      <IconButton
        size="small"
        onClick={handleMenuOpen}
        sx={{ ml: 1 }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleOrderInfo}>Order info</MenuItem>
        <MenuItem onClick={handleCopyToOrder}>Copy to order</MenuItem>
      </Menu>
    </>
  )
}
