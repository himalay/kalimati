import React, { createContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import api from '../utils/api'

export const GlobalContext = createContext()

export default function GlobalContextProvider({ children }) {
  const [commodities, setCommodities] = useState([])
  const [commodity, setCommodity] = useState('')
  const [commodityData, setCommodityData] = useState({ data: { x: [], y: [] } })

  useEffect(() => {
    api.get('/data/commodities.json').then(({ data: commodities }) => {
      setCommodities(commodities)
      setCommodity(commodities[2])
      api.get(`/data/${commodities[2]}.json`).then(({ data }) => {
        setCommodityData(data)
      })
    })
  }, [])

  return (
    <GlobalContext.Provider
      value={{ commodities, setCommodities, commodity, setCommodity, commodityData, setCommodityData }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

GlobalContextProvider.propTypes = { children: PropTypes.node }
