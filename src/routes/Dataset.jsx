import React, { useState, useContext } from 'react'
import Plot from 'react-plotly.js'
import { makeStyles } from '@material-ui/core/styles'
import green from '@material-ui/core/colors/green'
import Typography from '@material-ui/core/Typography'
import Slider from '@material-ui/core/Slider'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import cloneDeep from 'lodash.clonedeep'

import getSMA from '../utils/getSMA'
import { GlobalContext } from '../context/GlobalContext'

const useStyles = makeStyles(() => ({
  container: {
    marginTop: '2em',
  },
  averageSelector: {
    width: 200,
  },
  smaWindowSizeCount: {
    color: 'rgba(0, 0, 0, 0.54)',
  },
  card: {
    width: '100%',
  },
}))

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export default function Dataset() {
  const classes = useStyles()
  const { commodity, commodityData } = useContext(GlobalContext)
  const [smaWindowSize, setSmaWindowSize] = useState(14)

  return (
    <Grid container spacing={3} className={classes.container}>
      <Grid item xs={12}>
        <Slider
          defaultValue={14}
          valueLabelDisplay="auto"
          step={1}
          marks
          min={2}
          max={60}
          color="secondary"
          onChangeCommitted={(_, value) => setSmaWindowSize(value)}
        />
        <Typography id="discrete-slider">
          SMA (Simple Moving Average) Window Size<i className={classes.smaWindowSizeCount}> = {smaWindowSize} days</i>
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Card className={classes.card}>
          <CardContent>
            <Plot
              data={[
                { ...commodityData.data, name: 'Daily Price', marker: { color: green[800] } },
                getSMA(cloneDeep(commodityData.data), smaWindowSize),
              ]}
              layout={{
                autosize: true,
                title: commodity,
                xaxis: {
                  autorange: true,
                  range: [commodityData.data.x[0], commodityData.data.x[commodityData.data.x.length - 1]],
                  rangeselector: {
                    buttons: [
                      {
                        count: 1,
                        label: '1m',
                        step: 'month',
                        stepmode: 'backward',
                      },
                      {
                        count: 6,
                        label: '6m',
                        step: 'month',
                        stepmode: 'backward',
                      },
                      {
                        count: 1,
                        label: '1y',
                        step: 'year',
                        stepmode: 'backward',
                      },
                      {
                        count: 2,
                        label: '2y',
                        step: 'year',
                        stepmode: 'backward',
                      },
                      { step: 'all' },
                    ],
                  },
                  rangeslider: {
                    range: [commodityData.data.x[0], commodityData.data.x[commodityData.data.x.length - 1]],
                  },
                  type: 'date',
                },
                yaxis: {
                  autorange: true,
                  range: [Math.min(...commodityData.data.y), Math.max(...commodityData.data.y)],
                  type: 'linear',
                },
              }}
              style={{ width: '100%', height: '100%' }}
              useResizeHandler
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card className={classes.card}>
          <CardContent>
            <Plot
              data={[
                ...commodityData.data.y.reduce((acc, price, i) => {
                  if (price) {
                    const date = new Date(commodityData.data.x[i])
                    if (!acc[date.getMonth()]) {
                      const month = months[date.getMonth()]
                      acc[date.getMonth()] = {
                        y: [],
                        type: 'box',
                        name: month,
                      }
                    }
                    acc[date.getMonth()].y.push(price)
                  }

                  return acc
                }, []),
                { ...commodityData.monthly, name: 'Mean Price', marker: { color: green[800] } },
              ]}
              layout={{
                autosize: true,
                title: `${commodity} Price by Month`,
              }}
              style={{ width: '100%', height: '100%' }}
              useResizeHandler
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card className={classes.card}>
          <CardContent>
            <Plot
              data={[{ ...commodityData.yearly, name: 'Price', marker: { color: green[800] } }]}
              layout={{ autosize: true, title: `${commodity} Price by Year` }}
              style={{ width: '100%', height: '100%' }}
              useResizeHandler
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
