# Development Environment Setup with Docker

This guide will walk you through setting up and running the Smart Logger project on your local machine using Docker. This is the recommended method as it handles all dependencies and services automatically.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

-   **Git** for cloning the repository.
-   **Docker Desktop** for your operating system (Mac, Windows, or Linux). This single installation includes Docker Engine, the Docker CLI, and Docker Compose.

---

## 1. Clone the Repository

First, clone the project from the repository to your local machine.

```bash
git clone [https://github.com/eanda22/smart-logger.git](https://github.com/eanda22/smart-logger.git)
cd smart-logger
```

Of course. Here is the complete SETUP.md guide in a single markdown block that you can copy and paste directly into your file.

Markdown

# Development Environment Setup with Docker

This guide will walk you through setting up and running the Smart Logger project on your local machine using Docker. This is the recommended method as it handles all dependencies and services automatically.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

-   **Git** for cloning the repository.
-   **Docker Desktop** for your operating system (Mac, Windows, or Linux). This single installation includes Docker Engine, the Docker CLI, and Docker Compose.

---

## 1. Clone the Repository

First, clone the project from the repository to your local machine.

```bash
git clone https://github.com/eanda22/smart-logger.git
cd smart-logger
```

## 2. Launch the Application
With Docker Desktop running, you can build the images and launch all the application services (frontend, backend, and database) with a single command.

Navigate to the root directory of the project (where the docker-compose.yml file is located) and run:
```bash
docker compose up --build
```

``--build``: This flag tells Docker to build the images from the Dockerfiles the first time you run the command.

This process may take a few minutes as Docker downloads the base images and builds your application. You will see logs from all three services in your terminal.

## 3. Prepare the Database (First-Time Setup)
After the containers are running, you need to prepare the database by running the initial Django migrations.

Open a new terminal window (leave the one from the previous step running) and execute the following command:
```bash
docker compose exec backend python manage.py migrate
```
This command runs the migrate command inside the already running backend container.


## 4. Create a Superuser (Optional)
To access the Django admin interface, you need to create a superuser account.

In the same new terminal, run:
```bash
docker compose exec backend python manage.py createsuperuser
```
You will be prompted to enter a username, email, and password.

## 5. Accessing the Application
Your development environment is now fully up and running!

- Frontend Website: Open your browser and go to http://localhost:8080

- Backend Admin Panel: Navigate to http://localhost:8000/admin and log in with the superuser credentials you just created.

## Development Workflow & Management

- Live Reloading: The project is configured with volumes, meaning any changes you make to the code in the frontend or backend directories on your local machine will be automatically reflected in the running containers.

- Stopping the Application: To stop all services, go to the first terminal window (where you ran docker compose up) and press Ctrl + C.

- Removing Containers: To completely remove the containers and the network, run:
```bash
docker compose down
```

- Removing the Database: If you want to delete all your data and start with a fresh database, run:
```bash
docker compose down -v
```

## Advanced Development Workflow
While the application runs, you may need to interact directly with the services inside the containers for debugging, running specific commands, or exploring the database.

#### Accessing a Shell Inside a Container (CLI)
You can open a command-line shell (/bin/sh) inside any running container. This is useful for running one-off commands or exploring the container's file system.

**Ensure your containers are running:**
```bash
docker compose up
```
Open a new terminal window.

Execute into the desired container:
- To get a shell in the backend container (e.g., to use manage.py or pip):
```bash
docker compose exec backend sh
```
- Your terminal prompt will change, and you will now be inside the backend container's /app directory.

- To connect to the database with psql:
```bash
docker compose exec db psql -U user -d smart_logger
```
This will connect you directly to the PostgreSQL command-line interface. Type \q to exit.

#### Developing Inside a Container with VS Code
For the best development experience, you can use Visual Studio Code to attach directly to a running container. This allows you to edit code, use the terminal, and run the debugger inside the container, giving you full access to its environment and tools without needing to install Python or other dependencies on your local machine.

**Prerequisites:**

- Install Visual Studio Code.

- Install the Dev Containers extension from the VS Code Marketplace.

**Steps to Connect:**

- Start your application stack as usual:
```bash
docker compose up
```

- Open your project folder (the one with docker-compose.yml) in VS Code.

- Open the Command Palette (Cmd+Shift+P on Mac, Ctrl+Shift+P on Windows/Linux).

- Type Dev Containers: Attach to Running Container... and press Enter.

- VS Code will show you a list of your running containers. Select the /smart-logger-backend-1 container.

A new VS Code window will open, connected directly to the environment inside your backend container. You can now open a terminal (Ctrl+\`` or Cmd+``), edit files, set breakpoints, and run your Django application as if VS Code were running inside the container itself.
