const path = require('path')
const fs = require('fs')

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

const DATA_FOLDER = path.resolve(__dirname, '../src/assets/data')

const parseCSV = () => {
  const csv = fs.readFileSync(path.resolve(__dirname, './data.csv'), 'utf-8')
  // first row should be headers
  // first column should be date

  const [headers, ...rows] = csv.split('\n')
  const [, ...commodities] = headers.split(',')
  const variableCount = commodities.length
  const result = {}

  for (const row of rows) {
    const [date, ...prices] = row.split(',')
    const [year, month] = getYearMonth(date)

    let i = 0
    while (i < variableCount) {
      const price = +prices[i]
      const commodity = commodities[i]

      if (!result[commodity]) {
        result[commodity] = { data: { x: [], y: [] }, yearly: {}, monthly: {} }
      }

      if (price) {
        if (!result[commodity].yearly[year]) {
          result[commodity].yearly[year] = []
        }
        if (!result[commodity].monthly[month]) {
          result[commodity].monthly[month] = []
        }

        result[commodity].data.x.push(date)
        result[commodity].data.y.push(price)

        result[commodity].yearly[year].push(price)
        result[commodity].monthly[month].push(price)
      }

      i++
    }
  }

  for (const commodity of commodities) {
    result[commodity].yearly = calculateMean(result[commodity].yearly)
    result[commodity].monthly = sortByX(calculateMean(result[commodity].monthly), months)

    fs.writeFileSync(`${DATA_FOLDER}/${commodity}.json`, JSON.stringify(result[commodity]))
  }

  fs.writeFileSync(`${DATA_FOLDER}/commodities.json`, JSON.stringify(commodities))
}

function sortByX(data, sortedX) {
  const result = { x: [...sortedX], y: [...sortedX].map(() => 0) }

  data.x.forEach((key, i) => {
    const value = data.y[i]
    const index = sortedX.indexOf(key)
    result.y[index] = value
  })

  return result
}

function calculateMean(obj) {
  return Object.entries(obj).reduce(
    (acc, [key, prices]) => ({ x: [...acc.x, key], y: [...acc.y, +mean(prices).toFixed(2)] }),
    {
      x: [],
      y: [],
    },
  )
}

function mean(data) {
  return data.reduce((a, b) => a + b, 0) / data.length
}

function getYearMonth(dateString) {
  const date = new Date(dateString)

  const year = date.getFullYear() + ''
  const month = months[date.getMonth()]

  return [year, month]
}

if (require.main === module) {
  parseCSV()
}

module.exports = parseCSV
