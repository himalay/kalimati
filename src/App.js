import React, { Component } from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import { green700, deepOrange500 } from 'material-ui/styles/colors'
import injectTapEventPlugin from 'react-tap-event-plugin'
import AppBar from 'material-ui/AppBar'
import { Tabs, Tab } from 'material-ui/Tabs'
import SwipeableViews from 'react-swipeable-views'
import ActionFavorite from 'material-ui/svg-icons/action/favorite'
import ActionViewList from 'material-ui/svg-icons/action/view-list'

import FavoritePage from './Pages/Favorite/'
import AllPage from './Pages/All/'

injectTapEventPlugin()

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: green700,
    accent1Color: deepOrange500
  }
})

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      slideIndex: 0,
      dateEn: localStorage.getItem('dateEn'),
      dateNp: localStorage.getItem('dateNp'),
      data: JSON.parse(localStorage.getItem('data')) || [],
      favoriteList: JSON.parse(localStorage.getItem('favoriteList')) || {}
    }

     this.updateData = this.updateData.bind(this)
     this.updateDateEn = this.updateDateEn.bind(this)
     this.updateDateNp = this.updateDateNp.bind(this)
  }

  updateData (data) {
    this.setState({ data })
    localStorage.setItem('data', JSON.stringify(data))
  }

  updateFavoriteList (favoriteList) {
    this.setState({ favoriteList })
    localStorage.setItem('favoriteList', JSON.stringify(favoriteList))
  }

  updateDateEn (dateEn) {
    this.setState({ dateEn })
    localStorage.setItem('dateEn', dateEn)
  }

  updateDateNp (dateNp) {
    this.setState({ dateNp })
    localStorage.setItem('dateNp', dateNp)
  }

  componentWillMount () {
    getData(this.state.dateEn).then(({data, date, dateNp}) => {
      if (data && data.length) {
        this.updateData(data)
        this.updateDateNp(dateNp)
        this.updateDateEn(date)
      } else {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        getData(this.state.dateEn, yesterday).then(({data, date, dateNp}) => {
          this.updateData(data)
          this.updateDateNp(dateNp)
          this.updateDateEn(date)
        })
      }
    })
  }

  handleChange = (value) => {
    this.setState({
      slideIndex: value,
    })
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <AppBar
          className="appbar-bg"
          title={ <div className="appbar-title">
            <span>तरकारी</span>
            <span className="date-np">मिति: {this.state.dateNp}</span>
            </div> }
          showMenuIconButton={false}
          zDepth={0}
          />
          <Tabs
          className="tabbar-bg"
          onChange={this.handleChange}
          value={this.state.slideIndex}
          >
          <Tab icon={<ActionFavorite />} value={0} />
          <Tab icon={<ActionViewList />} value={1} />
        </Tabs>
        <SwipeableViews
          index={this.state.slideIndex}
          onChangeIndex={this.handleChange}
        >
          <FavoritePage Parent={ this } />
          <AllPage Parent={ this } />
        </SwipeableViews>
        </div>
      </MuiThemeProvider>
    )
  }
}

function getData (dateEn, date = new Date()) {
  return new Promise((resolve) => {
    if (dateEn && Math.abs((date - new Date(dateEn))) / 36e5 < 2) return resolve()

    let data = []
    const get2d = num => num.toString().length < 2 ? '0' + num : num
    fetch('https://cors-anywhere.herokuapp.com/kalimatimarket.gov.np/priceinfo/dlypricebulletin', {
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': 'http://kalimatimarket.gov.np'
        },
        body: `cdate=${get2d(date.getMonth() + 1) + '/' + get2d(date.getDate()) + '/' + date.getFullYear()}&pricetype=R`
      })
      .then(res => res.text())
      .then(html => {
        let tableRows = [...Object.assign(document.createElement('div'), {
          innerHTML: html
        }).querySelectorAll('table')[1].rows]

        let dateNp = tableRows[1].cells[0].innerText.trim()
        let headers = [...tableRows[2].cells].map(td => td.innerText.trim())

        data = tableRows.map((row, i) => {
          let obj = {}
          if(i > 2) {
            [...row.cells].forEach((td, j) => {
              obj[headers[j]] = td.innerText.trim()
            })
          }
          return obj
        }).splice(3)

        resolve({ date, dateNp, data})
      })
      .catch(console.error)
  })
}

export default App
