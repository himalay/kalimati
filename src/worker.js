/* eslint-disable no-undef */
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs')
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm')

const tfjs = tf
/* eslint-enable no-undef */

tfjs.wasm.setWasmPaths(`https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjs.wasm.version_wasm}/dist/`)
tfjs.setBackend('wasm').then(() => postMessage({ type: 'TF_READY' }))

// Worker listener
onmessage = async (event) => {
  try {
    let savedModel

    try {
      savedModel = await tfjs.loadLayersModel(`indexeddb://${event.data.key}`)
    } catch (error) {}

    if (event.data.type === 'TRAIN_MODEL') {
      if (savedModel) {
        return postMessage({ type: 'TRAIN_MODEL_SUCCESS' })
      }

      const { key, args } = event.data
      const onEpochEnd = (epoch, { loss }) => postMessage({ type: 'ON_EPOCH_END', data: { epoch, loss } })
      const model = await trainModel(...args, onEpochEnd)

      await model.save(`indexeddb://${key}`)

      postMessage({ type: 'TRAIN_MODEL_SUCCESS' })
    } else {
      if (savedModel) {
        if (event.data.type === 'HAS_MODEL') {
          postMessage({ type: 'HAS_MODEL_SUCCESS' })
        } else if (event.data.type === 'VALIDATE_MODEL') {
          const [smaSet, X, Y, datasetSize] = event.data.args
          const { input, label } = normalizeData(X, Y)
          const [, inputMax, inputMin] = input
          const [, labelMax, labelMin] = label

          postMessage({
            type: 'VALIDATE_MODEL_SUCCESS',
            data: validateModel(savedModel, smaSet, datasetSize, { inputMax, inputMin, labelMax, labelMin }),
          })
        } else if (event.data.type === 'MAKE_PREDICTIONS') {
          const [predX, X, Y, nDays] = event.data.args
          const { input, label } = normalizeData(X, Y)
          const [, inputMax, inputMin] = input
          const [, labelMax, labelMin] = label

          const data = [...predX[0]]
          const predictions = []

          let i = 0
          while (i < nDays) {
            if (predictions.length) {
              data.splice(0, 1)
              data.push(predictions[i - 1])
            }

            const prediction = makePredictions([data], savedModel, { inputMax, inputMin, labelMax, labelMin })
            predictions.push(...prediction)
            i++
          }

          postMessage({
            type: 'MAKE_PREDICTIONS_SUCCESS',
            predictions: fixPredictionDecimal(predictions),
          })
        } else {
          postMessage(event.data)
        }
      } else {
        postMessage({
          type: 'MODEL_NOT_FOUND',
          key: event.data.key,
        })
      }
    }
  } catch ({ message, stack }) {
    postMessage({ type: 'ERROR', message: message + stack })
  }
}

function validateModel(model, inputs, datasetSize, normalize) {
  // validate on training
  const valTrainX = inputs.slice(0, Math.floor((datasetSize / 100) * inputs.length))
  const valTrainY = makePredictions(valTrainX, model, normalize)

  // validate on unseen
  const valUnseenX = inputs.slice(Math.floor((datasetSize / 100) * inputs.length), inputs.length)
  const valUnseenY = makePredictions(valUnseenX, model, normalize)

  return { valTrainY: fixPredictionDecimal(valTrainY), valUnseenY: fixPredictionDecimal(valUnseenY) }
}

function fixPredictionDecimal(predictions) {
  return predictions.map((x) => +x.toFixed(2))
}

function makePredictions(X, model, { inputMax, inputMin, labelMax, labelMin }) {
  const xTensor = tfjs.tensor2d(X, [X.length, X[0].length])
  const normalizedInput = normalizeTensor(xTensor, inputMax, inputMin)
  const modelOut = model.predict(normalizedInput)
  const predictedResults = unNormalizeTensor(modelOut, labelMax, labelMin)

  return Array.from(predictedResults.dataSync())
}

async function trainModel(X, Y, windowSize, nEpochs, learningRate, nLayers, batchSize, onEpochEnd) {
  // input dense layer
  const inputLayerShape = windowSize
  const inputLayerNeurons = 64

  // LSTM
  const rnnInputLayerFeatures = 16
  const rnnInputLayerTimeSteps = inputLayerNeurons / rnnInputLayerFeatures
  const rnnInputShape = [rnnInputLayerFeatures, rnnInputLayerTimeSteps] // the shape have to match input layer's shape
  const rnnOutputNeurons = 16 // number of neurons per LSTM's cell

  // output dense layer
  const outputLayerShape = rnnOutputNeurons // dense layer input size is same as LSTM cell
  const outputLayerNeurons = 1 // return 1 value

  // load data into tensor and normalize data
  const { input, label } = normalizeData(X, Y)
  const [xs] = input
  const [ys] = label

  // ## define model

  const model = tfjs.sequential()

  model.add(tfjs.layers.dense({ units: inputLayerNeurons, inputShape: [inputLayerShape] }))
  model.add(tfjs.layers.reshape({ targetShape: rnnInputShape }))

  const lstmCells = []
  for (let index = 0; index < nLayers; index++) {
    lstmCells.push(tfjs.layers.lstmCell({ units: rnnOutputNeurons }))
  }

  model.add(
    tfjs.layers.rnn({
      cell: lstmCells,
      inputShape: rnnInputShape,
      returnSequences: false,
    }),
  )

  model.add(tfjs.layers.dense({ units: outputLayerNeurons, inputShape: [outputLayerShape] }))

  model.compile({
    optimizer: tfjs.train.adam(learningRate),
    loss: 'meanSquaredError',
  })

  // ## fit model

  // const hist =
  await model.fit(xs, ys, {
    batchSize: batchSize,
    epochs: nEpochs,
    callbacks: { onEpochEnd },
  })

  return model
}

function normalizeData(X, Y) {
  // load data into tensor and normalize data
  const inputTensor = tfjs.tensor2d(X, [X.length, X[0].length])
  const labelTensor = tfjs.tensor2d(Y, [Y.length, 1]).reshape([Y.length, 1])

  return {
    input: normalizeTensorFit(inputTensor),
    label: normalizeTensorFit(labelTensor),
  }
}

function normalizeTensorFit(tensor) {
  const maxVal = tensor.max()
  const minVal = tensor.min()
  const normalizedTensor = normalizeTensor(tensor, maxVal, minVal)
  return [normalizedTensor, maxVal, minVal]
}

function normalizeTensor(tensor, maxVal, minVal) {
  return tensor.sub(minVal).div(maxVal.sub(minVal))
}

function unNormalizeTensor(tensor, maxVal, minVal) {
  return tensor.mul(maxVal.sub(minVal)).add(minVal)
}
