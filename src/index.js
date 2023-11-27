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

app.post('/login',(req, res) => {

    const loginQuery = `SELECT * FROM users WHERE username=$1;`
    const usernameQueryParam = req.body.username

    db.query(loginQuery, [usernameQueryParam])
        .then(async (data) => {

            if (!data || !Array.isArray(data) || !data.length || data.length !== 1) {
                res.redirect( '/register')
                return
            }

            // check if password from request matches with password in DB
            const match = await bcrypt.compare(req.body.password, data[0].password)

            if (match) {
                //save user details in session like in lab 8
                req.session.user = data[0]
                req.session.save()

                res.redirect('pages/home')
                return
            }

            res.status(200).render('pages/login',{
                error: true,
                message: "username or password may be incorrect",
                omitNavbar: true,
                customBodyWidthEM: 60,
                fartherFromTop: true
            })
        })
        .catch(() => res.redirect( 'pages/register'))
})

app.get('/register', (req, res) => {
    res.status(200).render('pages/register',{omitNavbar: true, customBodyWidthEM: 60, fartherFromTop: true})
})

app.get('/edit-account', (req, res) => {
    // Check if user is logged in
    if (req.session.user) {
        // Render the registration page and pass user details to the template
        res.status(200).render('pages/account', {
            omitNavbar: false,
            customBodyWidthEM: 60,
            fartherFromTop: true,
            user: req.session.user 
        });
    } else {
        res.redirect('pages/login');
    }
});


app.post('/register', async (req, res) => {
    try {
        const { username, password, display_name, phone, email, bio } = req.body;

        // Hash the password using bcrypt library
        const hash = await bcrypt.hash(password, 10);

        // To-DO: Insert user details into 'users' table with auto-incrementing user_id
        const userQuery = `
            INSERT INTO users (username, password, display_name, phone, email, bio)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING user_id
        `;

        const result = await db.query(userQuery, [username, hash, display_name, phone, email, bio]);

        // console.log(req.body); 
        // console.log("Result of the INSERT query:", result);

        const userId = result[0].user_id;

        console.log("Registered: " + username + " with user_id: " + userId);
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.redirect('/register');
    }
});

app.post('/edit-account', async (req, res) => {
    try {
        const { username, display_name, phone, email, bio } = req.body;

        const userUpdateQuery = `
            UPDATE users
            SET display_name = $2, phone = $3, email = $4, bio = $5
            WHERE username = $1
            RETURNING user_id
        `;

        const result = await db.query(userUpdateQuery, [username, display_name, phone, email, bio]);

        // Check if the update was successful
        if (result && Array.isArray(result) && result.length === 1) {
            const userId = result[0].user_id;
            console.log("Updated user details for user_id: " + userId);
            res.redirect('/edit-account');
        } else {
            console.log("Failed to update user details");
            res.redirect('/edit-account');
        }
    } catch (error) {
        console.error(error);
        res.redirect('/edit-account');
    }
});



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

    const currentFriendId = req.params.friendId
    const hasCurrentFriend = !!currentFriendId

    const user_id = req.session.user.user_id
    const friendsQuery = `SELECT * FROM friends f INNER JOIN users u ON u.user_id = f.user_id_1 WHERE f.user_id_2 = $1`

    db.query(friendsQuery, [user_id])
        .then((data) => {

            if (!data || !Array.isArray(data)) {
                res.status(500).render('pages/friends', {
                    friends: {},
                    error: true,
                    message: "could not resolve friends in database. If this error persists, please reach out to customer service"
                })
                return
            }

            let currentFriend = undefined
            data.forEach((friend) => {
                if (friend.user_id === currentFriendId) currentFriend = friend
            })

            res.status(200).render('pages/friends',{
                currentFriend: currentFriend,
                friends: data
            })

        })
        .catch((error) => {
            console.log(error)
            res.status(500).send({
                friends: {},
                error: true,
                message: "could not resolve friends in database. If this error persists, please reach out to customer service"
            })
        })
})

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.status(200).render('pages/logout',{omitNavbar: true, customBodyWidthEM: 60, fartherFromTop: true});
  });

// start the server
module.exports = app.listen(3000)
console.log('Server is listening on port 3000')