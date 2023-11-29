# ContactMI

○ Description
    ContactMi is like Facebook but with contact information only. Users can enter their contact info on their personal profile page and make themselves visible to other users on the meet person page. Their home pages show a searchable list of users with a search bar and a favorite users display. Each user displayed on the home page shows their contact information and other profile information. Users will use their username and password to login on the login page, and all pages will have a logout button.

    This app is different from traditional social media because it is narrowly focused on storing information to contact users in other ways in a streamlined manner. It functions like a yellow book rather than an endorphin trap to make ad revenue like traditional social media.


○ Contributors (Full name - Github Username - Email)
    •Vidhaan Singhvi - vidhaansinghvi
    •Samuel Beste - sbeste11 - samuel.beste@colorado.edu 
    •Sansh Goel- Sansh28 - sago1198@colorado.edu
    •Nikhil Bailey - NikhilBailey21 - nikhil.bailey@colorado.edu
    •Adan Esparza - UESAdan - ades4326@colorado.edu
    •Tanmay Meti -Tanmay-Meti - tame4633@colorado.edu

○ Technology Stack used for the project

    •Frontend:
        •EJS (Embedded JavaScript):
            •EJS is a templating engine used for server-side rendering in the ContactMi application. It dynamically generates HTML pages, allowing users to view and interact with their personal profiles, search for other users, and manage favorites.

        •JavaScript:
            •JavaScript enhances the interactivity of the ContactMi frontend, enabling features like dynamic page updates, form validation, and asynchronous communication with the backend.
            
        •CSS (Cascading Style Sheets):
            •CSS styles are applied to the HTML elements, ensuring a visually appealing and user-friendly interface for ContactMi. The styling helps create a streamlined and intuitive experience for users.

    •Backend:
        •Node.js with Express:
            •Node.js powers the server-side logic of ContactMi, while Express provides a robust framework for building web applications. Together, they handle user authentication, profile management, and data retrieval from the PostgreSQL database.

        •PostgreSQL Database:
            •PostgreSQL serves as the database management system for storing user profiles, contact information, and other relevant data. It ensures data persistence and retrieval for ContactMi's functionality.

    •Other Tools:
        •Docker:
            •Docker is used for containerization in ContactMi, simplifying deployment and ensuring consistency across different environments. It encapsulates the application and its dependencies, making it easier to manage and scale.



○ Prerequisites
    •To run the ContactMi application locally, ensure you have the following software installed on your machine:
        •Docker: Install Docker on your system. 
        •Git: Install git on your system.


○ Instructions for Running Locally
    •Clone the Repository:
        •git clone https://github.com/vidhaansinghvi/ContactMI.git
        •cd ContactMI

    •Create Environment Variables:

    •Create a .env file in the project root directory.
        •Add the necessary environment variables required for both the database and Node.js application:
            # database credentials
            POSTGRES_USER="postgres"
            POSTGRES_PASSWORD="pwd"
            POSTGRES_DB="users_db"

            # Node vars
            SESSION_SECRET="super duper secret!"
            API_KEY="<API key you just created>"

    •Build and Start Docker Containers:
        •Run the following command to build and start the Docker containers:
            docker-compose up --build
            # This command will initialize the PostgreSQL database and start the Node.js application.

    •Access the Application:

        •Once the containers are up and running, you can access the application by navigating to http://localhost:3000 in your web browser.

    •Terminating the Application:
        •To stop and remove the Docker containers, press Ctrl+C in the terminal where Docker is running, and then run: 
        •(use the -v flag to clean up volumes)
            docker-compose down 

○ How to run the tests

○ Link to the deployed application
    •http://localhost:3000/