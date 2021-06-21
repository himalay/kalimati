import React from 'react'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles'
import green from '@material-ui/core/colors/green'
import orange from '@material-ui/core/colors/orange'
import CssBaseline from '@material-ui/core/CssBaseline'
import { Router } from 'react-router-dom'
import { createBrowserHistory } from 'history'

import GlobalContextProvider from './context/GlobalContext'
import Routes from './routes'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: green[800],
    },
    secondary: {
      main: orange[500],
    },
  },
})

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalContextProvider>
        <Router history={createBrowserHistory()}>
          <Routes />
        </Router>
      </GlobalContextProvider>
    </ThemeProvider>
  )
}
