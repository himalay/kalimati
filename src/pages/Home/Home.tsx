import KalimatiIcon from './KalimatiIcon'
import { CloseIconButtonWrapper, Search, SearchIconWrapper, StyledInputBase } from './styled'
import api from '@/api'
import { title } from '@/config'
import useNotifications from '@/store/notifications'
import useTheme from '@/store/theme'
import CloseIcon from '@mui/icons-material/Close'
import HeightIcon from '@mui/icons-material/Height'
import ThemeIcon from '@mui/icons-material/InvertColors'
import SearchIcon from '@mui/icons-material/Search'
import SortIcon from '@mui/icons-material/Sort'
import Alert from '@mui/material/Alert'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Slide from '@mui/material/Slide'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { styled, alpha } from '@mui/material/styles'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import debounce from '@mui/utils/debounce'
import { cloneElement, ReactElement, useEffect, useState, ChangeEvent, KeyboardEvent } from 'react'

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'flex-start',
  paddingTop: theme.spacing(1),
  marginBottom: -8,
  // Override media queries injected by theme.mixins.toolbar
  '@media all': {
    minHeight: 128,
  },
}))

interface Props {
  children: ReactElement
}

function ElevationScroll({ children }: Props) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  })

  return cloneElement(children, {
    elevation: trigger ? 4 : 0,
  })
}

interface Row {
  commodity: string
  unit: string
  min: number
  max: number
}

interface KalimatiData {
  date: string
  headers: string[]
  rows: Row[]
}

const SORT_ASC = 'ASC'
const SORT_DESC = 'DESC'
const KALIMATI_SORT = 'KALIMATI_SORT'
const initialSort = localStorage.getItem(KALIMATI_SORT) === SORT_DESC ? SORT_DESC : SORT_ASC

function Home() {
  const [, notificationsActions] = useNotifications()
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Row[]>([])
  const [sort, setSort] = useState<typeof SORT_ASC | typeof SORT_DESC>(initialSort)
  const [, themeActions] = useTheme()
  const [searchToggle, setSearchToggle] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredRows, setFilteredRows] = useState<Row[]>([])

  const handleSearchToggle = () => {
    setSearchToggle((prev) => {
      if (prev) {
        setSearchQuery('')
        setFilteredRows([])
      }

      return !prev
    })
  }

  const handleSearchChange = debounce((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setFilteredRows(
      rows
        .filter(({ commodity }) => commodity.toLowerCase().includes(value.toLowerCase()))
        .sort((a, b) => (sort === SORT_ASC ? a.min - b.min : b.min - a.min)),
    )
  }, 500)

  const handleSearchKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchQuery('')
      setFilteredRows([])
      setSearchToggle(false)
    }
  }

  const handleSort = () => {
    const value = sort === SORT_ASC ? SORT_DESC : SORT_ASC
    setRows(rows.sort((a, b) => (value === SORT_ASC ? a.min - b.min : b.min - a.min)))
    setSort(value)
    localStorage.setItem(KALIMATI_SORT, value)
  }

  useEffect(() => {
    setLoading(true)
    api
      .get<KalimatiData>('/data.json', { cache: { maxAge: 30 * 60 * 1000 } })
      .then(({ data }) => {
        setDate(data.date)
        setHeaders(data.headers)
        setRows(data.rows.sort((a, b) => (sort === SORT_ASC ? a.min - b.min : b.min - a.min)))
      })
      .catch((e: Error) => {
        console.error(e)
        notificationsActions.push({
          options: {
            autoHideDuration: 4500,
            content: <Alert severity="error">{e.message}</Alert>,
          },
        })
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <Container>
      {loading && <LinearProgress />}
      <ElevationScroll>
        <AppBar>
          <StyledToolbar>
            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
              <KalimatiIcon />
              <Typography
                gutterBottom={false}
                variant="h6"
                component="div"
                color="inherit"
                noWrap
                sx={{ flex: 1, textTransform: 'uppercase', lineHeight: 1 }}
              >
                {title}
                <Typography
                  component="span"
                  sx={{
                    fontSize: '0.6em',
                    display: 'block',
                    textTransform: 'none',
                    color: (t) => alpha(t.palette.text.primary, 0.5),
                  }}
                >
                  {date}
                </Typography>
              </Typography>
              <Tooltip title="Search" arrow>
                <IconButton size="large" onClick={handleSearchToggle} disabled={searchToggle}>
                  <SearchIcon />
                </IconButton>
              </Tooltip>
              <Slide direction="down" in={searchToggle} mountOnEnter unmountOnExit>
                <Search>
                  <SearchIconWrapper>
                    <SearchIcon />
                  </SearchIconWrapper>
                  <CloseIconButtonWrapper onClick={handleSearchToggle}>
                    <CloseIcon />
                  </CloseIconButtonWrapper>
                  <StyledInputBase
                    placeholder="Search…"
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    autoFocus
                  />
                </Search>
              </Slide>
              <Tooltip title="Switch theme" arrow>
                <IconButton size="large" onClick={themeActions.toggle}>
                  <ThemeIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Container sx={{ pl: 0, pr: 0 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{headers[0]}</TableCell>
                    <TableCell sx={{ width: 142 }}>
                      {headers[1]}
                      <Tooltip title="Sort" arrow>
                        <IconButton size="small" onClick={handleSort}>
                          <SortIcon
                            fontSize="small"
                            sx={{
                              transform: `scaleY(${sort === SORT_ASC ? '-' : ''}1)`,
                              color: (t) => alpha(t.palette.text.primary, 0.25),
                            }}
                          />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                </TableHead>
              </Table>
            </Container>
          </StyledToolbar>
        </AppBar>
      </ElevationScroll>
      <Table>
        <TableBody>
          {(searchQuery ? filteredRows : rows).map((row) => {
            return (
              <TableRow hover key={row.commodity}>
                <TableCell
                  sx={{
                    width: '100%',
                  }}
                >
                  {row.commodity}
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      width: 110,
                      display: 'flex',
                      alignItems: 'center',
                      textTransform: 'uppercase',
                    }}
                  >
                    <Typography sx={{ alignSelf: 'flex-end', fontSize: '0.8em', mr: -0.5 }}>{row.min}</Typography>
                    <HeightIcon sx={{ color: (t) => alpha(t.palette.text.primary, 0.25) }} />
                    <Typography sx={{ alignSelf: 'flex-start', fontSize: '0.8em', ml: -0.5, mr: 1 }}>
                      {row.max}
                    </Typography>{' '}
                    / {row.unit}
                  </Box>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Container>
  )
}

export default Home
