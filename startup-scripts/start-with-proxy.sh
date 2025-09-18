#!/bin/bash

# Start Vite dev server on port 8080 in the background
echo "🚀 Starting Vite dev server on port 8080..."
npm run dev &
VITE_PID=$!

# Wait a moment for Vite to start
sleep 3

# Start proxy server on port 5000
echo "🔄 Starting proxy server on port 5000..."
node proxy-server.js &
PROXY_PID=$!

# Function to cleanup processes on exit
cleanup() {
    echo "🛑 Stopping servers..."
    kill $VITE_PID 2>/dev/null
    kill $PROXY_PID 2>/dev/null
    exit
}

# Trap exit signals
trap cleanup SIGINT SIGTERM

# Keep the script running
echo "✅ Both servers are running!"
echo "📱 Vite dev server: http://localhost:8080"
echo "🌐 Proxy server: http://localhost:5000"
wait