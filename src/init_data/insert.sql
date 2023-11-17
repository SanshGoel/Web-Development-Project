INSERT INTO users (username, password, display_name, phone, email ) VALUES
('user123', 'pass123', 'John Doe', '+1234567890', 'john@example.com'),
('alice87', 'alicepass', 'Alice Smith', '+9876543210', 'alice@example.com'),
('bobsmith', 'bobpass123', 'Bob Johnson', '+1122334455', 'bob@example.com'),
('jane_doe', 'janepassword', 'Jane Doe', '+1555666777', 'jane@example.com'),
('sam99', 'sampass', 'Samuel Brown', '+1112223333', 'sam@example.com'),
('emily12', 'emilypass', 'Emily Davis', '+9998887777', 'emily@example.com'),
('max_power', 'maxpass', 'Max Power', '+7776665555', 'max@example.com'),
('laura88', 'laurapass', 'Laura White', '+3334445555', 'laura@example.com'),
('kevin78', 'kevinpass', 'Kevin Green', '+6667778888', 'kevin@example.com'),
('sophie33', 'sophiepass', 'Sophie Taylor', '+4445556666', 'sophie@example.com'),
('alexsmith', 'alexpass', 'Alex Smith', '+8889990000', 'alex@example.com'),
('mark007', 'markpass', 'Mark James', '+2223334444', 'mark@example.com'),
('hannah22', 'hannahpass', 'Hannah Lee', '+5554443333', 'hannah@example.com'),
('peter_parker', 'peterpass', 'Peter Parker', '+7778889999', 'peter@example.com'),
('olivia98', 'oliviapass', 'Olivia Wilson', '+1119998888', 'olivia@example.com'),
('chris84', 'chrispass', 'Chris Brown', '+4445556666', 'chris@example.com'),
('lily99', 'lilypass', 'Lily Johnson', '+2221113333', 'lily@example.com'),
('david_007', 'davidpass', 'David Davis', '+7778889999', 'david@example.com'),
('mia67', 'miapass', 'Mia Miller', '+5556667777', 'mia@example.com'),
('tommy22', 'tommypass', 'Tommy Thompson', '+8887776666', 'tommy@example.com');

INSERT INTO friends (user_id_1, user_id_2)  VALUES
(1, 2),
(1, 3),
(1, 4),
(2, 1),
(2, 3),

INSERT INTO pending_friends(requester_id, requestee_id) VALUES
 (1, 2),
 (1, 3),
 (1, 4),
 (2, 1),
 (2, 3),
 (3, 1),
 (3, 2),
 (3, 4),

INSERT INTO headshot(
    user_id,
) VALUES
 (1),
 (2),
 (3),
 (4),
