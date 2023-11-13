CREATE TABLE users (
    user_id INT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(60) NOT NULL,
    display_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100)
);

