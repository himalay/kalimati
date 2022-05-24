import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import { styled, alpha } from '@mui/material/styles'

export const Search = styled('div')(({ theme }) => ({
  position: 'fixed',
  zIndex: 1,
  right: 48 + 32,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.primary.main,
  '&:hover': {
    '&::before': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
  },
  '&::before': {
    content: '" "',
    display: 'block',
    height: '100%',
    width: '100%',
    borderRadius: theme.shape.borderRadius,
    position: 'absolute',
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    top: 0,
    left: 0,
    zIndex: -2,
  },
  width: `calc(100% - ${48 + 32 + 48 + 32}px)`,
  [theme.breakpoints.up('sm')]: {
    width: 300,
  },
  [theme.breakpoints.down('sm')]: {
    right: 64,
    width: `calc(100% - ${32 + 32 + 32 + 32}px)`,
  },
}))

export const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

export const CloseIconButtonWrapper = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: 39,
  color: 'inherit',
  width: 39,
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  right: 0,
}))

export const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: `calc(100% - ${32}px)`,
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
  },
}))
