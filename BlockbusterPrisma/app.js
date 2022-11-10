const express = require('express')
const router = require('./router')
const errorHandler = require('./middlewares/errorHandler')
require("dotenv").config()
const app = express()
const port = 3000
app.use(express.json());
app.use('/', router);
app.use(errorHandler.errorParser);
app.use(errorHandler.notFound);

const server = app.listen(port, () => {
  console.log(`Escuchando en puerto ${port}`)
})

module.exports = {
  app,
  server
};