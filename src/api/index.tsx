import axios from 'axios'

const PROXY_BASEURL = 'https://cors-anywhere.himalay.workers.dev/?'

// eslint-disable-next-line comma-spacing
const get = <T,>(url: string) => {
  const requestUrl = url.startsWith('https') ? PROXY_BASEURL + url : url

  return axios.get<T>(requestUrl)
}

export default { get }
