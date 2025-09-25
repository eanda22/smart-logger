# Development Environment Setup
This guide will walk you through setting up and running the Smart Logger project on your local machine for development. The project consists of a Django backend and a vanilla HTML, CSS, and JavaScript frontend.

## Prerequisites
Before you begin, ensure you have the following installed on your system:

- Python 3.8+ and pip
- PostgreSQL
- Git for cloning the repository

## 1. Automated Environment Setup (direnv)
For a much faster workflow, you can use direnv to automatically activate your Python virtual environment when you enter the project directory.

Install direnv. On macOS, you can use Homebrew:

```bash
brew install direnv
```

Hook it into your shell. Add the following line to your shell's configuration file (e.g., ~/.zshrc or ~/.bash_profile):

```bash
eval "$(direnv hook zsh)"
```

Restart your terminal or source your config file (e.g., source ~/.zshrc) to apply the changes.

The first time you navigate into the backend directory, you will need to authorize direnv to load the .envrc file.

```bash
cd backend
direnv allow
```

Now, your virtual environment will activate automatically every time you enter the backend directory.

## 2. Backend Setup (Django)
The backend server provides the API that the frontend communicates with.

#### a. Set up the Environment
Clone the repository (if you haven't already):

```bash
git clone https://github.com/eanda22/smart-logger.git
cd smart-logger
```

Navigate to the backend directory:

```
cd backend
```

Create the virtual environment (only needs to be done once):

```
python3 -m venv venv
```

Activate the virtual environment (if not using direnv):

```bash
source venv/bin/activate
```

Install Python dependencies (ensure the venv is active):
Use the requirements.txt file to install all the necessary packages.

```
pip install -r requirements.txt
```

#### b. Set up the PostgreSQL Database
Start the PostgreSQL service on your machine.

Create a new database. The project is configured to use a database named smart_logger. You can create it using the psql command-line tool or a graphical tool like pgAdmin.

```
CREATE DATABASE smart_logger;
```

Note: The default settings.py does not specify a user or password, assuming you can connect locally without them. If your PostgreSQL setup requires credentials, you will need to update the DATABASES section in backend/core/settings.py.

#### c. Prepare and Run the Backend Server
Run database migrations to create the necessary tables:

```
python manage.py migrate
```

Start the Django development server:

```
python manage.py runserver
```

Your backend API is now running and accessible at http://127.0.0.1:8000.

## 3. Frontend Setup (HTML/CSS/JS)
The frontend is a set of static files. You need to serve them using a simple local web server.

Open a new terminal window.

Navigate to the frontend directory:

```
cd smart-logger/frontend
```

Start a simple Python web server:

```
python3 -m http.server 8080
```

4. Accessing the Application
You can now view the website in your browser.

Open your web browser and navigate to: http://127.0.0.1:8080

The frontend at port 8080 will make API calls to the backend running on port 8000. This works because the Django setting CORS_ALLOW_ALL_ORIGINS = True allows cross-origin requests from any domain.