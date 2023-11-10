// import dependencies
const express = require('express') // To build an application server or API
const app = express()
const pgp = require('pg-promise')() // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser')
const session = require('express-session') // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt') //  To hash passwords
const axios = require('axios') // To make HTTP requests from our server. We'll learn more about it in Part B.

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

app.get('/', (req, res) => {
    res.redirect('/login')
})

app.get('/login', (req, res) => {
    res.render('pages/login',{})
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
                res.redirect('/login', {
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

                res.redirect('/discover')
                return
            }
            res.redirect('/register')
        })
        .catch(() => res.redirect('/login', {
            error: true,
            message: "could not resolve password in database. If this error persists, please reach out to customer service"
        }))
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
app.listen(3000)
console.log('Server is listening on port 3000')