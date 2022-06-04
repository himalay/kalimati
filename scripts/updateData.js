/* eslint-disable @typescript-eslint/no-var-requires */
const axios = require('axios')
const { wrapper } = require('axios-cookiejar-support')
const { CookieJar } = require('tough-cookie')
const { parse } = require('node-html-parser')
const { writeFileSync } = require('fs')

const axiosWithCookie = wrapper(axios)

const cookieJar = new CookieJar()

const httpHeaders = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:100.0) Gecko/20100101 Firefox/100.0'
}

axiosWithCookie
  .get('https://kalimatimarket.gov.np/lang/en', {
    headers: httpHeaders,
    jar: cookieJar,
    withCredentials: true,
  })
  .then(({ data }) => {
    const parsePrice = (price) => parseInt(price.replace('Rs.', '').trim())

    const parseRow = (row) => {
      const [commodity, unit, min, max] = row.textContent.split(/\s{2,}/).filter((x) => !!x.trim())

      return { commodity, unit, min: parsePrice(min), max: parsePrice(max) }
    }

    const document = parse(data)
    const dailyPriceTable = document.querySelector('#commodityPricesDailyTable')
    const date = dailyPriceTable.querySelector('h5').textContent.split('-').pop().replace('A.D.', '').trim()
    const headers = ['Commodity', 'Price (Rs)']
    const rows = dailyPriceTable.querySelectorAll('table tr:not(:first-child)').map(parseRow)

    writeFileSync('public/data.json', JSON.stringify({ date, headers, rows }))
  })
  .catch(console.error)
