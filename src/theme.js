
import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#0057b7' },
    secondary: { main: '#f9a825' },
    background: { default: '#fafafa' }
  },
  components: {
    MuiAppBar: { styleOverrides: { root: { backgroundColor: '#ffffff' } } }
  }
})

export default theme
