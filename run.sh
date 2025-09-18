#!/bin/bash
# Production deployment script for Replit
echo "🚀 Starting production deployment..."

# Build the frontend
echo "🏗️ Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend built successfully"

# Start the server
echo "🚀 Starting server..."
node server/index.js