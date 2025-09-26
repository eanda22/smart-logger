#!/bin/zsh

# This script automates the startup and shutdown process for the Smart Logger application.

# --- Function to start servers ---
start() {
    echo "Starting servers for Smart Logger..."

    # Start the Django backend server in the background
    echo "-> Starting Django backend server on port 8000..."
    (cd backend && source venv/bin/activate && python manage.py runserver) &

    # Start the simple Python frontend server in the background
    echo "-> Starting frontend server on port 8080..."
    (cd frontend && python3 -m http.server 8080) &

    echo "----------------------------------------"
    echo "✅ Servers are starting up."
    echo "Backend API will be at: http://127.0.0.1:8000"
    echo "Frontend app will be at: http://127.0.0.1:8080"
    echo "----------------------------------------"
}

# --- Function to stop servers ---
stop() {
    echo "Stopping servers for Smart Logger..."

    # Find and kill the server processes
    pkill -f 'python manage.py runserver'
    pkill -f 'python3 -m http.server 8080'

    echo "✅ Servers have been stopped."
}

# --- Main script logic ---
# Check the first argument passed to the script
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    *)
        # If no argument or an invalid one is given, show usage instructions
        echo "Usage: $0 {start|stop}"
        exit 1
        ;;
esac

