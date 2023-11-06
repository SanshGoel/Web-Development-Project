// import dependencies
const express = require('express')
const app = express()
const pgp = require('pg-promise')()


// start the server
app.listen(3000)
console.log('Server is listening on port 3000')

// database configuration
const dbConfig = {
    host: 'db',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
}
const db = pgp(dbConfig)