// import dependencies
const express = require('express')
const app = express()
const pgp = require('pg-promise')()


// start the server
app.listen(3000)
console.log('Server is listening on port 3000')