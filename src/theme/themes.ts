import { Themes } from './types'
import { green, red } from '@mui/material/colors'
import { ThemeOptions } from '@mui/material/styles'

const palette = {
  primary: green,
  secondary: red,
}

const themes: Record<Themes, ThemeOptions> = {
  light: {
    palette: {
      mode: 'light',
      ...palette,
    },
  },

  dark: {
    palette: {
      mode: 'dark',
      ...palette,
    },
  },
}

export default themes
