
import Chip from '@mui/material/Chip'

const map = {
  READY: { color: '#1976d2', label: 'READY' },
  COMPLETED: { color: '#2e7d32', label: 'COMPLETED' },
  UPDATED: { color: '#ed6c02', label: 'UPDATED' },
  RELEASEED: { color: '#1565c0', label: 'RELEASED' },
  RELEASED: { color: '#1565c0', label: 'RELEASED' },
}

export default function StatusChip({ value }){
  const conf = map[value] || { color: '#6b7280', label: String(value || '') }
  return (
    <Chip label={conf.label} size="small" sx={{ color: 'white', bgcolor: conf.color, fontWeight: 600 }} />
  )
}
