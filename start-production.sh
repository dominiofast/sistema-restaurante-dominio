#!/bin/bash
# Production start script for deployment
echo "🏗️ Building frontend for production..."
npm run build

echo "🚀 Starting production server..."
node server/index.js