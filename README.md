# ContactMI

## Description

ContactMi is a platform resembling Facebook but exclusively focuses on contact information sharing. Users can input their contact details on their profile pages and set visibility on the "meet person" section. The home page features a searchable list of users, a favorites display, and detailed user profiles. Login credentials are used for access, and a logout button is available on all pages. This platform diverges from traditional social media, emphasizing streamlined contact sharing over revenue generation through ads.

## Contributors

- Vidhaan Singhvi - [@vidhaansinghvi](https://github.com/vidhaansinghvi)
- Samuel Beste - [@sbeste11](https://github.com/sbeste11) - samuel.beste@colorado.edu
- Sansh Goel - [@Sansh28](https://github.com/Sansh28) - sago1198@colorado.edu
- Nikhil Bailey - [@NikhilBailey21](https://github.com/NikhilBailey21) - nikhil.bailey@colorado.edu
- Adan Esparza - [@UESAdan](https://github.com/UESAdan) - ades4326@colorado.edu
- Tanmay Meti - [@Tanmay-Meti](https://github.com/Tanmay-Meti) - tame4633@colorado.edu

## Technology Stack

### Frontend

- **EJS (Embedded JavaScript):** Server-side rendering engine for dynamic HTML page generation facilitating user profiles, search functionality, and favorites management.
- **JavaScript:** Enhances interactivity with features like dynamic updates, form validation, and asynchronous backend communication.
- **CSS (Cascading Style Sheets):** Applies styles for a visually appealing and user-friendly interface.

### Backend

- **Node.js with Express:** Powers server-side logic, managing user authentication, profiles, and PostgreSQL database interactions.
- **PostgreSQL Database:** Stores user profiles, contact details, and related data ensuring data persistence.

### Other Tools

- **Docker:** Utilized for containerization, streamlining deployment, and ensuring consistent application behavior across diverse environments.

## Prerequisites

To run ContactMi locally, ensure you have the following software installed:

- Docker: Install Docker on your system.
- Git: Install git on your system.

## Instructions for Running Locally
    - **Clone the Repository**
        •git clone https://github.com/vidhaansinghvi/ContactMI.git
        •cd ContactMI

    - **Create Environment Variables**

    - **Create a .env file in the project root directory**
        •Add the necessary environment variables required for both the database and Node.js application:
            # database credentials
            POSTGRES_USER="postgres"
            POSTGRES_PASSWORD="pwd"
            POSTGRES_DB="users_db"

            # Node vars
            SESSION_SECRET="super duper secret!"
            API_KEY="<API key you just created>"

    - **Build and Start Docker Containers**
        •Run the following command to build and start the Docker containers:
            docker-compose up --build
            # This command will initialize the PostgreSQL database and start the Node.js application.

    - **Access the Application**

        •Once the containers are up and running, you can access the application by navigating to http://localhost:3000 in your web browser.

    - **Terminating the Application**
        •To stop and remove the Docker containers, press Ctrl+C in the terminal where Docker is running, and then run: 
        •(use the -v flag to clean up volumes)
            docker-compose down 

## How to run the tests


## Link to the deployed application
    •http://localhost:3000/
