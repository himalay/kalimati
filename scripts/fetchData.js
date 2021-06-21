const path = require('path')
const fs = require('fs')

const PromisePool = require('@supercharge/promise-pool')
const axios = require('axios')

const RAW_DATA_DIR = path.resolve(__dirname, './raw-data')
const CSV_FILE_PATH = path.resolve(__dirname, 'data.csv')

if (!fs.existsSync(RAW_DATA_DIR)) {
  fs.mkdirSync(RAW_DATA_DIR)
}

const dates = []
let startDate = new Date('2013-04-15')
const endDate = new Date()

if (fs.existsSync(CSV_FILE_PATH)) {
  const lastDate = fs.readFileSync(CSV_FILE_PATH, 'utf-8').trim().split('\n').pop().split(',')[0]
  startDate = new Date(lastDate)
  startDate.setDate(startDate.getDate() + 1)
}

if (endDate.getHours() < 8) {
  endDate.setDate(endDate.getDate() - 1)
}

// eslint-disable-next-line no-unmodified-loop-condition
while (startDate <= endDate) {
  const dd = String(startDate.getDate()).padStart(2, '0')
  const mm = String(startDate.getMonth() + 1).padStart(2, '0')
  const yyyy = startDate.getFullYear()
  dates.push(`${yyyy}-${mm}-${dd}`)
  startDate.setDate(startDate.getDate() + 1)
}

PromisePool.for(dates)
  .withConcurrency(12)
  .process(async (date) => {
    console.log(`Fetching "${date}"...`)

    /*
    curl 'https://kalimatimarket.gov.np/price' \
    -H 'Content-Type: application/x-www-form-urlencoded' \
    -H 'Cookie: XSRF-TOKEN=eyJpdiI6ImFEcXFHUFdaY3A4RXVpWjU1ODlIUEE9PSIsInZhbHVlIjoiS09ubWdDamhTSkRvaFNoanpFOTJuNXVtTDROQldZa2E5WlQ5ek9IUVBnNng1dVZDbjFOWTV2cVZQSHpDdUV1RXFXWkV4dTk1TmlNa2xaSWJzV3Q4NEI4VVZ2Uk85bTVaWlVZNnRlT2x5YWFoOXJ2MEo5WWdnRVRHbjl0UXc3UWgiLCJtYWMiOiI1NjlkMGQ5MGQ3ZTI1ZTIxNWNkZmMzNDAwN2RjODUyZjdiMTY0NDE4OGY2ZDM0YTYxYmQxZjFmN2IzZWI0OGUxIn0%3D; kalimati_market_session=eyJpdiI6ImpGUHd4UzhxTUtPekMxUWdVNENaV3c9PSIsInZhbHVlIjoiQ2hwWXFEMFQzK3FTMjhSWVhtNDRQQWI0U0VBanBrSGc0cVYzak5mYzVjSEZPT1M3MFRuQVoxdWJHOWVDOGhIMnp0OW0vK21mK1czL3BGZVYvbjA3ZnBLc2lFR2RtcC9FLzNDSjQyUW5yd2FSeFdUNjdVSWJray81ZWRJbEY1MnYiLCJtYWMiOiJmMzMyODg2ZWI1OTBjNDViZmY1MDQyMjBkNzQ2NWI4YmVlNzg3ODI1Zjk1OTI2MDVjMzliODAzOTFiOGIyZWQ1In0%3D' \
    --data-raw '_token=Esi9hXPgUXKHkGjqCbjiT3jFF8mPK1kXgVFO9dJ8&datePricing=2021-06-20'
    */
    const { data: html } = await axios({
      url: 'https://kalimatimarket.gov.np/price',
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:82.0) Gecko/20100101 Firefox/82.0',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Cookie:
          'XSRF-TOKEN=eyJpdiI6ImFEcXFHUFdaY3A4RXVpWjU1ODlIUEE9PSIsInZhbHVlIjoiS09ubWdDamhTSkRvaFNoanpFOTJuNXVtTDROQldZa2E5WlQ5ek9IUVBnNng1dVZDbjFOWTV2cVZQSHpDdUV1RXFXWkV4dTk1TmlNa2xaSWJzV3Q4NEI4VVZ2Uk85bTVaWlVZNnRlT2x5YWFoOXJ2MEo5WWdnRVRHbjl0UXc3UWgiLCJtYWMiOiI1NjlkMGQ5MGQ3ZTI1ZTIxNWNkZmMzNDAwN2RjODUyZjdiMTY0NDE4OGY2ZDM0YTYxYmQxZjFmN2IzZWI0OGUxIn0%3D; kalimati_market_session=eyJpdiI6ImpGUHd4UzhxTUtPekMxUWdVNENaV3c9PSIsInZhbHVlIjoiQ2hwWXFEMFQzK3FTMjhSWVhtNDRQQWI0U0VBanBrSGc0cVYzak5mYzVjSEZPT1M3MFRuQVoxdWJHOWVDOGhIMnp0OW0vK21mK1czL3BGZVYvbjA3ZnBLc2lFR2RtcC9FLzNDSjQyUW5yd2FSeFdUNjdVSWJray81ZWRJbEY1MnYiLCJtYWMiOiJmMzMyODg2ZWI1OTBjNDViZmY1MDQyMjBkNzQ2NWI4YmVlNzg3ODI1Zjk1OTI2MDVjMzliODAzOTFiOGIyZWQ1In0%3D',
      },
      data: `_token=Esi9hXPgUXKHkGjqCbjiT3jFF8mPK1kXgVFO9dJ8&datePricing=${date}`,
    })

    fs.writeFileSync(`${RAW_DATA_DIR}/${date.replace(/\//g, '-')}.html`, html)
  })
  .then(({ errors, results }) => {
    if (errors.length) {
      console.error('oh noes!', errors)
    } else {
      console.log('all done!!!')
    }
  })
