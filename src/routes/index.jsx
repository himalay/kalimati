import React, { useContext, lazy, Suspense } from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Container from '@material-ui/core/Container'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import ShowChartIcon from '@material-ui/icons/ShowChart'
import TimelineIcon from '@material-ui/icons/Timeline'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'

import { Route, Switch, Redirect, useHistory, useLocation } from 'react-router-dom'

import api from '../utils/api'
import { GlobalContext } from '../context/GlobalContext'

import ComboBox from '../components/ComboBox'
import Skeleton from '../components/Skeleton'

const Dataset = lazy(() => import('./Dataset'))
const Predictions = lazy(() => import('./Predictions'))
const About = lazy(() => import('./About'))

const useStyles = makeStyles((theme) => ({
  appBarOffset: theme.mixins.toolbar,
  menuButton: {
    marginRight: 16,
    '& img': {
      height: 40,
    },
  },
  space: { flex: 1 },
  comboBoxWrapper: {
    marginTop: '2em',
  },
}))

export default function Routes() {
  const classes = useStyles()
  const history = useHistory()
  const location = useLocation()
  const { commodities, commodity, setCommodity, setCommodityData } = useContext(GlobalContext)
  const theme = useTheme()
  const matches = useMediaQuery(theme.breakpoints.down('sm'))

  const commodityChangeHandler = (_, value) => {
    setCommodity(value)
    api.get(`/data/${value}.json`).then(({ data }) => {
      setCommodityData({ ...data, fetchedAt: Date.now() })
    })
  }

  const tabChangeHandler = (_, value) => {
    history.push(value)
  }

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} onClick={() => history.replace('/')} color="inherit">
            <img src="/icons/icon-72x72.png" />
          </IconButton>
          <Typography variant="h6" style={matches ? {  display: 'none'  } : {}}>
            Kalimati Fruits & Vegetables
          </Typography>
          <div className={classes.space}></div>
          <Tabs value={location.pathname} onChange={tabChangeHandler}>
            <Tab label="Dataset" icon={<ShowChartIcon />} value="/dataset" />
            <Tab label="Predictions" icon={<TimelineIcon />} value="/predictions" />
            <Tab label="About" icon={<InfoOutlinedIcon />} value="/about" />
          </Tabs>
        </Toolbar>
      </AppBar>
      <div className={classes.appBarOffset} />
      <Container className={classes.container}>
        {location.pathname !== '/about' && (
          <div className={classes.comboBoxWrapper}>
            <ComboBox
              label="Select Commodity"
              value={commodity}
              options={commodities}
              onChange={commodityChangeHandler}
            />
          </div>
        )}
        <Switch>
          <Route exact path="/" component={() => <Redirect to="/dataset" />} />
          <Route
            exact
            path="/dataset"
            component={() => (
              <Suspense fallback={<Skeleton />}>
                <Dataset />
              </Suspense>
            )}
          />
          <Route
            exact
            path="/predictions"
            component={() => (
              <Suspense fallback={<Skeleton />}>
                <Predictions />
              </Suspense>
            )}
          />
          <Route
            exact
            path="/about"
            component={() => (
              <Suspense fallback={<div />}>
                <About />
              </Suspense>
            )}
          />
          <Route component={() => <Redirect to="/dataset" />} />
        </Switch>
      </Container>
    </>
  )
}
