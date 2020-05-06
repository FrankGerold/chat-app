const path = require('path')
const express = require('express')

require('./db/mongoose')

const router = require('./routes/router')
const publicPath = path.join(__dirname, '../public')

const app = express()
  .use(express.json())
  // .use(router)
  .use(express.static(publicPath))


module.exports = app;
