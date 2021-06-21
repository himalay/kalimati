const path = require('path')
const fs = require('fs')
const axios = require('axios')

const { parseHTML } = require('./utils/html')
const parseCSV = require('./parseCSV')

const DATA_CSV_PATH = path.resolve(__dirname, './data.csv')

const csvRows = fs.readFileSync(DATA_CSV_PATH, 'utf-8').trim().split('\n')
const headers = csvRows[0].trim().split(',')
const lastDate = csvRows.pop().split(',')[0]
const today = new Date()
const dd = String(today.getDate()).padStart(2, '0')
const mm = String(today.getMonth() + 1).padStart(2, '0')
const yyyy = today.getFullYear()
const date = `${yyyy}-${mm}-${dd}`
const dataExists = date === lastDate

if (!dataExists && today.getHours() > 7) {
  axios.get('https://kalimatimarket.gov.np/price').then(({ data: html }) => {
    const row = parseHTML(date, headers, html)
    fs.appendFileSync(DATA_CSV_PATH, row + '\n')
    parseCSV()
  })
}
