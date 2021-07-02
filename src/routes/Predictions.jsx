import React, { useContext, useEffect, useRef, useState, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Plot from 'react-plotly.js'
import Typography from '@material-ui/core/Typography'
import Slider from '@material-ui/core/Slider'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import orange from '@material-ui/core/colors/orange'
import green from '@material-ui/core/colors/green'
import purple from '@material-ui/core/colors/purple'
import blue from '@material-ui/core/colors/blue'
import grey from '@material-ui/core/colors/grey'
import CircularProgress from '@material-ui/core/CircularProgress'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { GlobalContext } from '../context/GlobalContext'
import computeSMA from '../utils/computeSMA'
import CircularProgressbar from '../components/CircularProgressbar'
import Worker from '../worker.js'

const useStyles = makeStyles(() => ({
  container: {
    marginTop: '1em',
  },
}))

function formatDate(date) {
  const d = new Date(date)
  let month = '' + (d.getMonth() + 1)
  let day = '' + d.getDate()
  const year = d.getFullYear()

  if (month.length < 2) month = '0' + month
  if (day.length < 2) day = '0' + day

  return [year, month, day].join('-')
}

const DEFAULT_DATA_SIZE = 98
const DEFAULT_EPOCHS = 20
const DEFAULT_LEARNING_RATE = 0.02
const DEFAULT_LSTM_LAYERS = 1
const DEFAULT_SMA_WINDOW_SIZE = 1
const DEFAULT_BATCH_SIZE = 32
const DEFAULT_PREDICTION_DAYS = 7

export default function Predictions() {
  const classes = useStyles()
  const workerRef = useRef()
  const { commodity, commodityData } = useContext(GlobalContext)
  const [datasetSize, setDatasetSize] = useState(DEFAULT_DATA_SIZE)
  const [epochs, setEpochs] = useState(DEFAULT_EPOCHS)
  const [learningRate, setLearningRate] = useState(DEFAULT_LEARNING_RATE)
  const [lstmLayers, setLstmLayers] = useState(DEFAULT_LSTM_LAYERS)
  const [smaWindowSize, setSmaWindowSize] = useState(DEFAULT_SMA_WINDOW_SIZE)
  const [batchSize, setBatchSize] = useState(DEFAULT_BATCH_SIZE)
  const [predictionDays, setPredictionDays] = useState(DEFAULT_PREDICTION_DAYS)
  const [training, setTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [trainingLogs, setTrainingLogs] = useState([])
  const [validationData, setValidationData] = useState([])
  const [predictions, setPredictions] = useState([])
  const [hasModel, setHasModel] = useState(false)
  const [tfReady, setTfReady] = useState(false)
  const [showModalTraining, setShowModalTraining] = useState(false)
  const [validatingModel, setValidatingModel] = useState(false)

  const modelValidationPlotRef = useRef()

  const getModelKey = useCallback(() => {
    const lastDate = commodityData.data.x[commodityData.data.x.length - 1]
    return `${commodity}-${lastDate}-${datasetSize}-${smaWindowSize}-${epochs}-${learningRate}-${lstmLayers}-${batchSize}`
      .replace(/\s+/g, '_')
      .toLocaleLowerCase()
  }, [batchSize, commodity, commodityData.data.x, datasetSize, epochs, learningRate, lstmLayers, smaWindowSize])

  const trainModelHandler = async () => {
    setTraining(true)
    setTrainingProgress(0)
    setTrainingLogs([])

    const smaVec = computeSMA(commodityData.data, smaWindowSize)
    // [{set: [price], avg: avgPrice}, ...]
    let inputs = smaVec.map(({ set }) => set)
    let outputs = smaVec.map(({ avg }) => avg)
    inputs = inputs.slice(0, Math.floor((datasetSize / 100) * inputs.length))
    outputs = outputs.slice(0, Math.floor((datasetSize / 100) * outputs.length))

    workerRef.current.postMessage({
      type: 'TRAIN_MODEL',
      key: getModelKey(),
      args: [inputs, outputs, smaWindowSize, epochs, learningRate, lstmLayers, batchSize],
    })
  }

  const validateModel = useCallback(() => {
    if (!validatingModel) {
      setValidatingModel(true)
      const smaVec = computeSMA(commodityData.data, smaWindowSize)
      const smaSet = smaVec.map(({ set }) => set)
      const smaAvg = smaVec.map(({ avg }) => avg)
      const X = smaSet.slice(0, Math.floor((datasetSize / 100) * smaSet.length))
      const Y = smaAvg.slice(0, Math.floor((datasetSize / 100) * smaAvg.length))

      workerRef.current.postMessage({
        type: 'VALIDATE_MODEL',
        key: getModelKey(),
        args: [smaSet, X, Y, datasetSize],
      })
    }
  }, [validatingModel, commodityData.data, datasetSize, getModelKey, smaWindowSize])

  const makePredictions = useCallback(
    (nDays) => {
      const smaVec = computeSMA(commodityData.data, smaWindowSize)
      const smaSet = smaVec.map(({ set }) => set)
      const smaAvg = smaVec.map(({ avg }) => avg)
      const X = smaSet.slice(0, Math.floor((datasetSize / 100) * smaSet.length))
      const Y = smaAvg.slice(0, Math.floor((datasetSize / 100) * smaAvg.length))

      let predX = [smaSet[smaSet.length - 1]]
      predX = predX.slice(Math.floor((datasetSize / 100) * predX.length), predX.length)

      workerRef.current.postMessage({
        type: 'MAKE_PREDICTIONS',
        key: getModelKey(),
        args: [predX, X, Y, nDays || predictionDays],
      })
    },
    [commodityData.data, datasetSize, getModelKey, predictionDays, smaWindowSize],
  )

  const cancelModelTraining = () => {
    workerRef.current.terminate()
    setTraining(false)
    workerRef.current = new Worker()
  }

  useEffect(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker()
    }

    const workerMessageHandler = (event) => {
      const { type, data } = event.data

      if (type === 'TF_READY') {
        setTfReady(true)
        workerRef.current.postMessage({
          type: 'HAS_MODEL',
          key: getModelKey(),
        })
      } else if (type === 'MODEL_NOT_FOUND') {
        setHasModel(false)
      } else if (type === 'HAS_MODEL_SUCCESS') {
        setHasModel(true)
        validateModel()
      } else if (type === 'ON_EPOCH_END') {
        const { epoch, loss } = data
        setTrainingProgress(Math.ceil((epoch + 1) * (100 / epochs)))
        setTrainingLogs([...trainingLogs, { epoch, loss }])
      } else if (type === 'TRAIN_MODEL_SUCCESS') {
        setHasModel(true)
        validateModel()
        setTraining(false)
      } else if (type === 'VALIDATE_MODEL_SUCCESS') {
        const { valTrainY, valUnseenY } = data
        const smaVec = computeSMA(commodityData.data, smaWindowSize)
        const inputs = smaVec.map(({ set }) => set)
        const inputCount = inputs.length
        const dataCount = commodityData.data.x.length
        const timestampsB = commodityData.data.x.slice(
          smaWindowSize,
          dataCount - Math.floor(((100 - datasetSize) / 100) * dataCount),
        )
        const timestampsC = commodityData.data.x.slice(
          Math.floor((datasetSize / 100) * inputCount) + smaWindowSize - 1,
          inputCount + smaWindowSize - 1,
        )
        let sma = smaVec.map(({ avg }) => avg)
        sma = sma.slice(0, Math.floor((datasetSize / 100) * sma.length))

        setValidationData([
          { ...commodityData.data, name: 'Price', marker: { color: green[800] } },
          { x: timestampsB, y: sma, name: 'SMA', marker: { color: orange[500] } },
          { x: timestampsB, y: valTrainY, name: 'Predicted (train)', marker: { color: purple[500] } },
          { x: timestampsC, y: valUnseenY, name: 'Predicted (test)', marker: { color: blue[500] } },
        ])
        makePredictions()

        setTimeout(() => {
          modelValidationPlotRef.current.el.querySelector('g.button:nth-child(4)').dispatchEvent(new Event('click'))
        }, 100)
      } else if (type === 'MAKE_PREDICTIONS_SUCCESS') {
        const { predictions } = event.data
        const dataCount = commodityData.data.y.length
        const nDaysOfLatestTrend = predictionDays < 7 ? 7 : predictionDays
        const latestTrend = commodityData.data.y.slice(dataCount - nDaysOfLatestTrend, dataCount)
        const dates = commodityData.data.x.slice(dataCount - nDaysOfLatestTrend, dataCount)

        // date
        const lastDate = new Date(dates[dates.length - 1])
        const predictionDates = new Array(predictions.length).fill(1).map((x) => {
          lastDate.setDate(lastDate.getDate() + x)
          return formatDate(lastDate.toString())
        })

        setPredictions([
          { x: dates, y: latestTrend, name: 'Latest Trends', marker: { color: grey[600] } },
          { x: predictionDates, y: predictions, name: 'Predicted Price', marker: { color: blue[500] } },
        ])

        setValidatingModel(false)
      } else {
        setTraining(false)
        setValidatingModel(false)
        console.log('[worker]: ', event.data)
      }
    }

    workerRef.current.addEventListener('message', workerMessageHandler)

    return () => {
      workerRef.current.removeEventListener('message', workerMessageHandler)
    }
  }, [
    trainingLogs,
    smaWindowSize,
    epochs,
    datasetSize,
    getModelKey,
    validateModel,
    commodityData.data,
    makePredictions,
    predictionDays,
  ])

  useEffect(() => {
    if (commodityData.fetchedAt) {
      setValidationData([])
      setPredictions([])
      setTrainingLogs([])
      setTrainingProgress([])
      setTimeout(() => {
        workerRef.current.postMessage({
          type: 'HAS_MODEL',
          key: getModelKey(),
        })
      }, 0)
    }
  }, [commodityData.fetchedAt, getModelKey])

  return (
    <Grid container spacing={6} className={classes.container}>
      <Grid item xs={12}>
        <Accordion expanded={!hasModel || showModalTraining} onChange={() => setShowModalTraining(!showModalTraining)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading}>
              Model Training <small style={{ color: grey[600] }}>(Click here to toggle the Accordion)</small>
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Typography variant="h4">Hyperparameters</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Slider
                  defaultValue={DEFAULT_DATA_SIZE}
                  valueLabelDisplay="on"
                  step={0.5}
                  marks
                  min={80}
                  max={100}
                  disabled={training}
                  onChangeCommitted={(_, value) => setDatasetSize(value)}
                />
                <Typography>Training Dataset Size (%)</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Slider
                  defaultValue={DEFAULT_EPOCHS}
                  valueLabelDisplay="on"
                  step={1}
                  marks
                  min={2}
                  max={500}
                  disabled={training}
                  onChangeCommitted={(_, value) => setEpochs(value)}
                />
                <Typography>Epochs</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Slider
                  defaultValue={DEFAULT_LEARNING_RATE}
                  valueLabelDisplay="on"
                  step={0.01}
                  marks
                  min={0.01}
                  max={0.1}
                  disabled={training}
                  onChangeCommitted={(_, value) => setLearningRate(value)}
                />
                <Typography>Learning Rate</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Slider
                  defaultValue={DEFAULT_LSTM_LAYERS}
                  valueLabelDisplay="on"
                  step={1}
                  marks
                  min={1}
                  max={4}
                  disabled={training}
                  onChangeCommitted={(_, value) => setLstmLayers(value)}
                />
                <Typography>Hidden LSTM Layers</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Slider
                  defaultValue={DEFAULT_BATCH_SIZE}
                  valueLabelDisplay="on"
                  step={null}
                  marks={[16, 32, 64, 128, 256, 512].map((value) => ({ value }))}
                  min={16}
                  max={512}
                  disabled={training}
                  onChangeCommitted={(_, value) => setBatchSize(value)}
                />
                <Typography>Batch Size</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Slider
                  defaultValue={DEFAULT_SMA_WINDOW_SIZE}
                  valueLabelDisplay="on"
                  step={1}
                  marks
                  min={1}
                  max={30}
                  disabled={training}
                  color="secondary"
                  onChangeCommitted={(_, value) => setSmaWindowSize(value)}
                />
                <Typography>SMA Window Size (days)</Typography>
                <small>Dataset for training model</small>
              </Grid>
              <Grid item xs={12} md={6}>
                Predictions are performed using Recurrent Neural Network (RNN) and Long Short-Term Memory (LSTM).
              </Grid>
              <Grid item xs={12} md={6}>
                {training && (
                  <>
                    <CircularProgressbar value={trainingProgress} />
                    <Button onClick={cancelModelTraining}>Cancel</Button>
                  </>
                )}
                {!training && (
                  <Button disabled={!tfReady} variant="contained" color="secondary" onClick={trainModelHandler}>
                    Train Model and Predict
                  </Button>
                )}
              </Grid>
              {(trainingLogs.length > 0 || training) && (
                <Grid item xs={12}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Card
                        style={{
                          width: '100%',
                        }}
                      >
                        <CardContent>
                          <Plot
                            data={[
                              {
                                x: Array.from({ length: trainingLogs.length }, (v, k) => k + 1),
                                y: trainingLogs.map(({ loss }) => loss),
                                marker: { color: green[800] },
                              },
                            ]}
                            layout={{ autosize: true, title: 'Loss' }}
                            style={{ width: '100%', height: '100%' }}
                            useResizeHandler
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card
                        style={{
                          width: '100%',
                          height: '100%',
                          overflow: 'auto',
                          maxHeight: 490,
                        }}
                      >
                        <CardContent>
                          {trainingLogs.map(({ epoch, loss }) => (
                            <code key={epoch + loss} style={{ color: 'gray', display: 'block' }}>
                              Epoch: <span style={{ color: orange[500] }}>{epoch + 1}</span> / {epochs}, Loss:{' '}
                              <span style={{ color: green[800] }}>{loss}</span>
                            </code>
                          ))}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid item xs={12}>
        <Card
          style={{
            width: '100%',
            position: 'relative',
          }}
        >
          <CardContent>
            <Plot
              ref={modelValidationPlotRef}
              data={validationData}
              layout={{
                autosize: true,
                title: 'Model Validation',
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
          {validatingModel && (
            <CircularProgress
              style={{
                position: 'absolute',
                top: 'calc(50% - 20px)',
                left: 'calc(50% - 20px)',
              }}
            />
          )}
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card
          style={{
            width: '100%',
            position: 'relative',
          }}
        >
          <CardContent>
            <Plot
              data={predictions}
              layout={{ autosize: true, title: 'Predictions' }}
              style={{ width: '100%', height: '100%' }}
              useResizeHandler
            />
          </CardContent>
          {validatingModel && (
            <CircularProgress
              style={{
                position: 'absolute',
                top: 'calc(50% - 20px)',
                left: 'calc(50% - 20px)',
              }}
            />
          )}

          <div
            style={{
              position: 'absolute',
              top: '6em',
              right: '2em',
              width: '33%',
              display: 'flex',
              placeContent: 'center',
            }}
          >
            <Typography style={{ width: '12em' }}>Prediction Days:</Typography>
            <Slider
              defaultValue={DEFAULT_PREDICTION_DAYS}
              valueLabelDisplay="on"
              step={1}
              marks
              min={1}
              max={30}
              disabled={training || validatingModel || !hasModel}
              onChangeCommitted={(_, value) => {
                setPredictionDays(value)
                makePredictions(value)
              }}
            />
          </div>
        </Card>
      </Grid>
    </Grid>
  )
}
