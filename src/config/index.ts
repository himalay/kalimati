import type { Notifications } from './types'

const title = 'Kalimati'

const messages = {
  app: {
    crash: {
      title: 'Oooops... Sorry, I guess, something went wrong. You can:',
      options: {
        reset: 'Press here to reset the application',
      },
    },
  },
  loader: {
    fail: 'Hmmmmm, there is something wrong with this component loading process... Maybe trying later would be the best idea',
  },
}

const notifications: Notifications = {
  options: {
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'left',
    },
    autoHideDuration: 6000,
  },
  maxSnack: 3,
}

const loader = {
  // no more blinking in your app
  delay: 300, // if your asynchronous process is finished during 300 milliseconds you will not see the loader at all
  minimumLoading: 700, // but if it appears, it will stay for at least 700 milliseconds
}

const defaultMetaTags = {
  image: '/cover.png',
  description: 'Daily commodity price information published by Kalimati Fruits and Vegetable Market.',
}

const giphy404 = 'https://giphy.com/embed/YyKPbc5OOTSQE'

export { loader, notifications, messages, title, defaultMetaTags, giphy404 }
