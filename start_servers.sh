#!/bin/bash

# Pull latest changes
echo "Pulling latest changes from git..."
git pull origin main

# Start Backend
echo "Starting Django Backend..."
cd HomeServerBE

# Check for virtual environment
if [ -d ".venv" ]; then
    source .venv/bin/activate
else
    echo "Warning: .venv not found in HomeServerBE. Attempting to run with system python..."
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Run migrations
echo "Running Django migrations..."
python manage.py migrate

# Run Django server in background on 0.0.0.0 to allow external access
# This is important for accessing the Pi from other devices
python manage.py runserver 0.0.0.0:8000 &
BE_PID=$!
cd ..

# Start Frontend
echo "Starting Frontend..."
cd homeserver-fe

# Install Node dependencies
echo "Installing Node dependencies..."
npm install

# Run npm dev in background with --host to allow external access
# The extra -- passes arguments to the underlying vite command
npm run dev -- --host &
FE_PID=$!
cd ..

# Function to handle script termination
cleanup() {
    echo "Stopping servers..."
    kill $BE_PID
    kill $FE_PID
    exit
}

# Trap SIGINT (Ctrl+C) to run cleanup
trap cleanup SIGINT

echo "Both servers are starting up..."
echo "Backend PID: $BE_PID"
echo "Frontend PID: $FE_PID"
echo "Access the frontend at http://<YOUR_PI_IP>:3000"
echo "Access the backend at http://<YOUR_PI_IP>:8000"
echo "Press Ctrl+C to stop both servers."

# Wait for processes to finish (keeps script running)
wait
