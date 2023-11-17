CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(60) NOT NULL,
    display_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    bio VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS friends (
    user_id_1 INT,
    user_id_2 INT,
    FOREIGN KEY (user_id_1) REFERENCES users(user_id),
    FOREIGN KEY (user_id_2) REFERENCES users(user_id),
    PRIMARY KEY (user_id_1, user_id_2)
);

CREATE TABLE IF NOT EXISTS pending_friends(
    requester_id INT,
    requestee_id INT,
    FOREIGN KEY (requester_id) REFERENCES users(user_id),
    FOREIGN KEY (requestee_id) REFERENCES users(user_id),
    PRIMARY KEY (requester_id, requestee_id),
    CHECK (requester_id != requestee_id)
);

CREATE TABLE IF NOT EXISTS headshot(
    user_id INT,
    img BYTEA
);



