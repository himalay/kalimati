const fs = require('fs')
const path = require('path')
const htmlParser = require('node-html-parser')

const RAW_DATA_DIR = path.resolve(__dirname, './raw-data')
const CSV_FILE_PATH = path.resolve(__dirname, 'data.csv')
const parseHtmlFileMemoized = memoizer(parseHtmlFile)

const fileNames = fs.readdirSync(RAW_DATA_DIR)
const commoditySet = new Set()

;(async () => {
  for (const fileName of fileNames) {
    const { commodities } = await parseHtmlFileMemoized(`${RAW_DATA_DIR}/${fileName}`)

    commodities.forEach((x) => commoditySet.add(x))
  }
  const headers = ['Date', ...commoditySet]

  fs.writeFileSync(CSV_FILE_PATH, headers.join(',') + '\n')
  for (const fileName of fileNames) {
    const date = path.parse(fileName).name // 2013-04-15
    const { avgPrices, commodities } = await parseHtmlFileMemoized(`${RAW_DATA_DIR}/${fileName}`)
    const row = new Array(headers.length)
    row[0] = date
    for (const [i, commodity] of commodities.entries()) {
      const index = headers.indexOf(commodity)
      row[index] = avgPrices[i]
    }
    const csvRow = row.join(',')
    if (/(,[\d.]+){1,}/.test(csvRow)) {
      fs.appendFileSync(CSV_FILE_PATH, csvRow + '\n')
    }
  }
})()

function memoizer(fun) {
  const cache = {}
  return async (n) => {
    if (cache[n] !== undefined) {
      return cache[n]
    } else {
      const result = await fun(n)
      cache[n] = result
      return result
    }
  }
}

async function parseHtmlFile(filePath) {
  const htmlString = fs.readFileSync(filePath, 'utf-8')
  const document = htmlParser.parse(htmlString)
  const commodities = [...document.querySelectorAll('td:first-child')].map((x) => x.textContent.trim())
  const avgPrices = [...document.querySelectorAll('td:nth-child(5)')].map((x) => +x.textContent.trim())
  return { avgPrices, commodities }
}
