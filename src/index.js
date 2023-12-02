// import dependencies
const express = require('express') // To build an application server or API
const app = express()
const pgp = require('pg-promise')() // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser')
const session = require('express-session') // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt') //  To hash passwords
const axios = require('axios')
const {add} = require("nodemon/lib/rules")

const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });


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

            if (!data || !Array.isArray(data) || data.length > 1) {
                res.redirect( '/register')
                return
            }

            if (data.length === 0) {
                res.status(400).render('pages/login',{
                    error: true,
                    message: "username or password may be incorrect",
                    omitNavbar: true,
                    customBodyWidthEM: 60,
                    fartherFromTop: true
                })
                return
            }

            // check if password from request matches with password in DB
            const match = await bcrypt.compare(req.body.password, data[0].password)

            if (match) {
                //save user details in session like in lab 8
                req.session.user = data[0]
                req.session.save()

                res.redirect('/home')
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
        res.status(200).render('pages/edit-account', {
            omitNavbar: false,
            customBodyWidthEM: 60,
            fartherFromTop: true,
            user: req.session.user 
        });
    } else {
        res.redirect('pages/login');
    }
});


app.post('/register', upload.single('image'), async (req, res) => {
    try {
        const { username, password, display_name, phone, email, bio } = req.body;

        //Check if a user already exists with that name
        const preexistingCheck = `
            SELECT * 
            FROM users 
            WHERE username = $1
        `

        const preexistingUsers = await db.query(preexistingCheck, [username])
        if (username === "" || password === "" || !preexistingUsers || !Array.isArray(preexistingUsers) || preexistingUsers.length > 0) {
            res.status(400).render('pages/register',{
                omitNavbar: true,
                customBodyWidthEM: 60,
                fartherFromTop: true,
                error: true,
                message: "username already exists"
            })
            return
        }

        // Hash the password using bcrypt library
        const hash = await bcrypt.hash(password, 10);

        // To-DO: Insert user details into 'users' table with auto-incrementing user_id
        const userQuery = `
            INSERT INTO users (username, password, display_name, phone, email, bio)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING user_id
        `

        const result = await db.query(userQuery, [username, hash, display_name, phone, email, bio])
        if(!result || !Array.isArray(result) || result.length < 1) {
            res.status(400).render('pages/register',{
                omitNavbar: true,
                customBodyWidthEM: 60,
                fartherFromTop: true,
                error: true,
                message: "could not resolve UserId in database. If this error persists, please reach out to our support team"
            })
            return
        }
        const userId = result[0].user_id;

        if(req.file){
            const imagePath = req.file.path;

            // SQL query to insert or update the image path
            const query = 'INSERT INTO headshot (user_id, img_path) VALUES ($1, $2)';
            await db.query(query, [userId, imagePath]);
        }else{
            const imagePath = 'uploads/OIP.jpeg';
            const query = 'INSERT INTO headshot (user_id, img_path) VALUES ($1, $2)';
            await db.query(query, [userId, imagePath]);
        }


        console.log("Registered: " + username + " with user_id: " + userId)
        res.redirect('/login')
    } catch (error) {
        console.error(error)
        res.redirect('/register')
    }
})

app.post('/edit-account', upload.single('image'),async (req, res) => {
    try {
        const { username, display_name, phone, email, bio } = req.body;


        const userUpdateQuery = `
            UPDATE users
            SET display_name = $2, phone = $3, email = $4, bio = $5
            WHERE username = $1
            RETURNING *;
        `;

        const result = await db.query(userUpdateQuery, [username, display_name, phone, email, bio]);

        
        if(req.file){
            const imagePath = req.file.path;

            // SQL query to insert or update the image path
            const updateQuery = 'UPDATE headshot SET img_path = $1 WHERE user_id = $2'
            await db.query(updateQuery, [imagePath, result[0].user_id]);
        }

        
        
   
        // Check if the update was successful
        if (result && Array.isArray(result) && result.length === 1) {
            const updatedUserDetails = result[0];
            console.log("Updated user details for user_id: " + updatedUserDetails.user_id);

            // Update session user with the most recent details
            req.session.user = updatedUserDetails;
            req.session.save();

            // Render the template with the updated user details from the session
            res.render('pages/edit-account', {
                omitNavbar: false,
                customBodyWidthEM: 60,
                fartherFromTop: true,
                user: req.session.user
            });
        } else {
            console.log("Failed to update user details");
            res.redirect('/edit-account');
        }
    } catch (error) {
        console.error(error);
        res.redirect('/edit-account');
    }
});

app.get('/user-image/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId); // Convert userId to a number

    try {
        const selectquery = 'SELECT img_path FROM headshot WHERE user_id = $1';
        
        const result = await db.query(selectquery, [userId]);
        const fullpath = path.resolve(result[0].img_path);
        res.sendFile(fullpath)// Adjust the path according to your directory structure

       
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
});

app.use('/uploads', express.static('uploads'));





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
    const { user_id, display_name, phone, email, profile_image } = req.session.user;
    
    
    res.status(200).render('pages/home', {
        userID: user_id,
        displayName: display_name,
        phoneNumber: phone,
        email: email,
        profileImage: profile_image || '/images/default-profile.png'
    })
})

app.post('/addFriend', (req, res) => {
    const { user_id } = req.session.user
    const friendToAdd = req.body.friendToAdd
    console.log(friendToAdd)

    if (!friendToAdd) {
        res.status(400).json({
            error: true,
            message: "Failed to specify which friend. If this error persists, please reach out to customer support."
        })
        return
    }

    const checkIfFriendReqExists = `
        SELECT *
        FROM pending_friends
        WHERE requester_id = $1
        AND requestee_id = $2
    `

    db.query(checkIfFriendReqExists, [user_id, friendToAdd])
        .then((data) => {
            if (!data || !Array.isArray(data)) {
                res.status(500).send({
                    friends: {},
                    error: true,
                    message: "could not resolve friend request in database. If this error persists, please reach out to customer service"
                })
                return
            }

            if (data.length === 0) {
                const addFriendRequestQuery = `
                    INSERT INTO pending_friends (requester_id, requestee_id) 
                    VALUES ($1, $2)
                `

                db.query(addFriendRequestQuery, [user_id, friendToAdd])
                    .then(() => res.status(200).json({
                        error: false,
                        message: "Friend request sent"
                    }))
                    .catch(() => res.status(500).json({
                        error: true,
                        message: "Failed to add friend request. If this error persists, please reach out to customer support."
                    }))
                return
            }

            res.status(200).json({
                error: false,
                message: "Friend request sent"
            })
        })
        .catch(() => res.status(500).json({
            error: true,
            message: "Failed to add friend request. If this error persists, please reach out to customer support."
        }))
})
        
app.get('/friends', (req, res) => {
    const user_id = req.session.user.user_id;

    const friendsQuery = `
        SELECT * FROM friends f
        INNER JOIN users u ON u.user_id = f.user_id_1
        WHERE f.user_id_2 = $1
    `;

    db.query(friendsQuery, [user_id])
        .then((friendsData) => {

            const pendingRequestsQuery = `
                SELECT * FROM pending_friends p
                INNER JOIN users u ON u.user_id = p.requester_id
                WHERE p.requestee_id = $1
            `;

            return db.query(pendingRequestsQuery, [user_id])
                .then((pendingRequestsData) => {

                    return {
                        friends: friendsData,
                        pendingRequests: pendingRequestsData,
                    };
                });
        })
        .then(({ friends, pendingRequests }) => {
            let currentFriend = undefined;
            const currentFriendId = req.body.friendId;

            friends.forEach((friend) => {
                if (friend.user_id === currentFriendId) currentFriend = friend;
            });

            res.status(200).render('pages/friends', {
                currentFriend: currentFriend,
                friends: friends,
                pendingRequests: pendingRequests,
            });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).render('pages/friends', {
                friends: {},
                error: true,
                message: "Could not resolve friends or pending friend requests in the database. If this error persists, please reach out to customer service",
            });
        });
});



app.get("/logout", (req, res) => {
    req.session.destroy();
    res.status(200).render('pages/logout',{omitNavbar: true, customBodyWidthEM: 60, fartherFromTop: true});
  });

  // Search feature for finding friends- still need to verify with test cases(vidhaan)

// Search Friends
app.post('/search', async (req, res) => {
    try {
        const searchQuery = req.body.searchQuery
        const page = req.body.page ? req.body.page : 1
        const pageSize = req.body.pageSize ? req.body.pageSize : 10
        const searchAll = !!req.body.searchAll || searchQuery === ""
        const offset = (page - 1) * pageSize

        const searchUsers = !!req.body.searchUsers && (req.body.searchUsers !== "false")

        if (!searchAll && !searchQuery) {
            res.status(400).render( searchUsers ? 'pages/users' : 'pages/friends', {
                friends: {},
                error: true,
                message: "Bad request. If this error persists, please reach out to customer service"
            })
            return
        }

        if (searchUsers) {
            // Search all users with pagination, considering display_name, email, and phone
            searchAllUsersQuery = searchAll ? `
                SELECT users.* --, headshot.img
                FROM users
                --LEFT JOIN headshot ON users.user_id = headshot.user_id
                ORDER BY display_name
                --LIMIT $2 OFFSET $3
            `
                : `
                SELECT users.* --, headshot.img
                FROM users
                --LEFT JOIN headshot ON users.user_id = headshot.user_id
                WHERE LOWER(display_name) LIKE '%' || LOWER($1) || '%'
                    OR LOWER(email) LIKE '%' || LOWER($1) || '%'
                    OR LOWER(phone) LIKE '%' || LOWER($1) || '%'
                ORDER BY display_name
                --LIMIT $2 OFFSET $3
            `

            const result = await db.query(searchAllUsersQuery, [searchQuery, pageSize, offset])

            if (!result || !Array.isArray(result)) {
                res.status(500).render('pages/users', {
                    friends: {},
                    error: true,
                    message: "Could not resolve users in database. If this error persists, please reach out to customer service"
                })
                return
            }

            res.status( 200).render('pages/users', {
                friends: result
            })

        } else {
            // Search friends with pagination, considering display_name, email, and phone
            searchFriendsQuery = searchAll ? `
                SELECT users.* --, headshot.img
                FROM users
                --LEFT JOIN headshot ON users.user_id = headshot.user_id
                WHERE users.user_id IN (
                    SELECT user_id_1 AS user_id FROM friends WHERE user_id_2 = $2
                )
                ORDER BY display_name
                --LIMIT $2 OFFSET $3
            ` : `
                SELECT users.* --, headshot.img
                FROM users
                --LEFT JOIN headshot ON users.user_id = headshot.user_id
                WHERE (LOWER(display_name) LIKE '%' || LOWER($1) || '%'
                    OR LOWER(email) LIKE '%' || LOWER($1) || '%'
                    OR LOWER(phone) LIKE '%' || LOWER($1) || '%')
                    AND users.user_id IN (
                        SELECT user_id_1 AS user_id FROM friends WHERE user_id_2 = $2
                    )
                ORDER BY display_name
                --LIMIT $3 OFFSET $4
            `

            const result = await db.query(searchFriendsQuery, [searchQuery, req.session.user.user_id, pageSize, offset]);

            if (!result || !Array.isArray(result)) {
                res.status(500).render('pages/friends', {
                    friends: {},
                    error: true,
                    message: "Could not resolve friends in database. If this error persists, please reach out to customer service"
                })
                return
            }

            let currentFriend = undefined
            const currentFriendId = req.body.friendId
            result.forEach((friend) => {
                if (friend.user_id == currentFriendId) currentFriend = friend
            })

            res.status( 200).render('pages/friends', {
                friends: result,
                currentFriend: currentFriend
            })
        }
    } catch (error) {
        console.error(error)
        res.status(500).render('pages/friends',{
            error: true,
            message: 'Could not resolve users in search route. If this error persists, please reach out to customer service',
        })
    }
})

app.post('/acceptFriendRequest', async (req, res) => {
    try {
        const requesterId = req.body.requesterId;
        const requesteeId = req.session.user.user_id;

        const deletePendingRequestQuery = `
            DELETE FROM pending_friends
            WHERE requester_id = $1 AND requestee_id = $2;
        `;
        await db.query(deletePendingRequestQuery, [requesterId, requesteeId]);

        const addFriendQuery = `
            INSERT INTO friends (user_id_1, user_id_2)
            VALUES ($1, $2), ($2, $1);
        `;
        await db.query(addFriendQuery, [requesterId, requesteeId]);

        res.redirect('/friends');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/rejectFriendRequest', async (req, res) => {
    try {
        const requesterId = req.body.requesterId;
        const requesteeId = req.session.user.user_id;

        const deletePendingRequestQuery = `
            DELETE FROM pending_friends
            WHERE requester_id = $1 AND requestee_id = $2;
        `;
        await db.query(deletePendingRequestQuery, [requesterId, requesteeId]);

        res.redirect('/friends');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// start the server
module.exports = app.listen(3000)
console.log('Server is listening on port 3000')
