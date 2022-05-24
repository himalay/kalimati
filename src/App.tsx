import { withErrorHandler } from '@/error-handling'
import AppErrorBoundaryFallback from '@/error-handling/fallbacks/App'
import useServiceWorker from '@/hooks/useServiceWorker'
import Notifications from '@/sections/Notifications'
import asyncComponentLoader from '@/utils/loader'
import { getPageHeight, getTopSpacing } from '@/utils/sizes'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import { Fragment } from 'react'

const HomePage = asyncComponentLoader(() => import('@/pages/Home'))

function App() {
  useServiceWorker()

  return (
    <Fragment>
      <CssBaseline />
      <Notifications />
      <Box sx={{ height: getPageHeight, marginTop: (t) => getTopSpacing(t) * 2 - 8 + 'px' }}>
        <HomePage />
      </Box>
    </Fragment>
  )
}

export default withErrorHandler(App, AppErrorBoundaryFallback)
