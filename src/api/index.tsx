import { GetOptions } from './types'
import { AxiosPromise } from 'axios'
import { setup } from 'axios-cache-adapter'
import localforage from 'localforage'

const store = localforage.createInstance({
  driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
  name: 'kalimati-api-cache',
})

const session = setup({
  timeout: 10000,
  cache: {
    store,
    maxAge: 24 * 60 * 60 * 1000,
    exclude: { query: false },
  },
})

// eslint-disable-next-line comma-spacing
const get = <T,>(url: string, options?: GetOptions): AxiosPromise<T> =>
  session.get<T>(url, { params: options?.params, cache: options?.cache })

export default { get }
