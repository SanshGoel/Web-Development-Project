// import dependencies
const express = require('express') // To build an application server or API
const app = express()
const pgp = require('pg-promise')() // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser')
const session = require('express-session') // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt') //  To hash passwords
const axios = require('axios')

// database configuration
const dbConfig = {
    host: 'db',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD
}
const db = pgp(dbConfig)

// App settings
app.set('views', './src/views')
app.set('view engine', 'ejs') // set the view engine to EJS
app.use(bodyParser.json()) // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
    })
)

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

// *****************************************************
//                  API Routes
// *****************************************************

// *****************************************************
//                  Without Auth
// *****************************************************

app.get('/welcome', (req, res) => {
    res.json({status: 'success', message: 'Welcome!'})
})

app.get('/', (req, res) => {
    res.status(200).redirect('/login')
})

app.get('/login', (req, res) => {
    res.status(200).render('pages/login',{omitNavbar: true, customBodyWidthEM: 60, fartherFromTop: true})
})

app.post('/login', async (req, res) => {

    const loginQuery = `SELECT * FROM users WHERE username = $1;`
    const usernameQueryParam = req.body.username

    db.query(loginQuery, [usernameQueryParam])
        .then(async (data) => {

            if (!data) {
                res.redirect('/register')
                return
            }
            if (typeof data !== "object" || !data.length || data.length !== 1) {
                res.status(500).redirect('/login', {
                    error: true,
                    message: "could not resolve password in database. If this error persists, please reach out to customer service"
                })
            }

            // check if password from request matches with password in DB
            const match = await bcrypt.compare(req.body.password, data[0].password)

            if (match) {
                //save user details in session like in lab 8
                req.session.user = data[0]
                req.session.save()

                res.status(200).redirect('pages/home')
                return
            }
            res.status(400).redirect('pages/register')
        })
        .catch(() => res.status(500).redirect('pages/login', {
            error: true,
            message: "could not resolve password in database. If this error persists, please reach out to customer service"
        }))
})

app.get('/register', (req, res) => {
    res.status(200).render('pages/register',{omitNavbar: true, customBodyWidthEM: 60, fartherFromTop: true})
})

app.get('/debug', (req, res) => {
    res.status(200).render('pages/friends',{})
})

// *****************************************************
//                 With Auth
// *****************************************************

// Authentication Middleware.
const auth = (req, res, next) => {
    if (!req.session.user) {
        // Default to login page.
        return res.redirect('/login')
    }
    next()
}

// Authentication Required
app.use(auth)

app.get('/home', (req, res) => {

})

app.get('/friends', (req, res) => {
    // res.render('pages/friends')
})

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.render("pages/logout");
  });

// start the server
module.exports = app.listen(3000)
console.log('Server is listening on port 3000')