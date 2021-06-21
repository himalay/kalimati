import localforage from 'localforage'
import { setup } from 'axios-cache-adapter'

const forageStore = localforage.createInstance({
  driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
  name: 'kalimati',
})

export default setup({
  cache: {
    maxAge: 15 * 60 * 1000,
    store: forageStore,
  },
})
