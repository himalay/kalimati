import React from 'react'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import Link from '@material-ui/core/Link'

import logo from '../assets/icons/icon-128x128.png'

export default function DataExploration() {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        pt: 8,
        pb: 6,
      }}
    >
      <Container align="center" maxWidth="md" style={{ marginTop: '2em' }}>
        <img alt="Kalimati Fruits & Vegetables" src={logo} />
        <Typography variant="h4" gutterBottom>
          Kalimati Fruits & Vegetables
        </Typography>
        <Typography variant="h6" paragraph gutterBottom>
          This project is done as a part of MSc Dissertation by{' '}
          <Link href="https://himalay.com.np">Himalay Sunuwar</Link>. The datasets used in this project are collected
          from publicly available webpages of the official{' '}
          <Link href="https://kalimatimarket.gov.np/price" target="_blank" rel="noreferrer">
            Kalimati Market
          </Link>{' '}
          website.
        </Typography>
        <hr />
        <Typography variant="h6" gutterBottom>
          Disclaimer
        </Typography>
        <Typography paragraph>
          This web application and the information provided here are for educational purposes only. Nothing published
          here constitutes any investment recommendation, nor should any data or content published on this web
          application be relied upon for any investment activities. <strong>Himalay Sunuwar</strong> and{' '}
          <strong>Kalimati Fruits And Vegetable Market Development Board</strong> will not be responsible for the
          consequences of using the information provided here.
        </Typography>
      </Container>
    </Box>
  )
}
