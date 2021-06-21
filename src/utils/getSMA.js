import orange from '@material-ui/core/colors/orange'

export default function getSMA(data, windowSize) {
  const dataLength = data.x.length
  const sma = {
    x: data.x.slice(windowSize, dataLength),
    y: [],
    name: 'SMA',
    marker: { color: orange[500] },
  }

  for (let i = 0; i <= dataLength - windowSize; i++) {
    let average = 0.0
    const t = i + windowSize
    for (let k = i; k < t && k <= dataLength; k++) {
      average += data.y[k] / windowSize
    }
    sma.y.push(average)
  }

  return sma
}
