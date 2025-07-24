#!/bin/bash
# Dev server with auto-restart and clean port handling

# Kill any existing processes on our ports
kill_existing() {
  lsof -ti:5173 | xargs kill -9 2>/dev/null || true
  lsof -ti:8787 | xargs kill -9 2>/dev/null || true
  pkill -f "vite" 2>/dev/null || true
}

# Trap to clean up on exit
trap kill_existing EXIT

echo "Starting dev server with auto-restart..."
echo "Logs will be in ./tmp/dev-server.log"

# Create tmp directory if it doesn't exist
mkdir -p ./tmp

# Main loop
while true; do
  kill_existing
  
  echo "[$(date)] Starting server..." | tee -a ./tmp/dev-server.log
  
  # Run npm start and capture output
  npm start >> ./tmp/dev-server.log 2>&1 &
  SERVER_PID=$!
  
  # Wait for server to crash or be killed
  wait $SERVER_PID
  EXIT_CODE=$?
  
  echo "[$(date)] Server exited with code $EXIT_CODE" | tee -a ./tmp/dev-server.log
  
  # Wait a bit before restarting
  sleep 2
done