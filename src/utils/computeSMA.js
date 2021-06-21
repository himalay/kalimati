export default function computeSMA(data, windowSize) {
  // data = {x: [date], y: [price]}
  const dataLength = data.y.length
  const result = []
  for (let i = 0; i <= dataLength - windowSize; i++) {
    let avg = 0.0
    const t = i + windowSize
    for (let k = i; k < t && k <= dataLength; k++) {
      avg += data.y[k] / windowSize
    }
    result.push({ set: data.y.slice(i, i + windowSize), avg })
  }
  return result // [{set: [price], avg: avgPrice}, ...]
}
