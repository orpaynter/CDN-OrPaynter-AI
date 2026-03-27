#!/bin/bash

# CDN-OrPaynter-AI Runner Script
# This script helps run the Next.js application

set -e

echo "==================================="
echo "CDN-OrPaynter-AI Application Runner"
echo "==================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Display available commands
echo "Available commands:"
echo "  dev   - Run development server (default)"
echo "  build - Build production version"
echo "  start - Run production server"
echo ""

# Get command from argument or default to dev
COMMAND=${1:-dev}

case $COMMAND in
  dev)
    echo "🚀 Starting development server..."
    npm run dev
    ;;
  build)
    echo "🔨 Building production version..."
    npm run build
    ;;
  start)
    echo "▶️  Starting production server..."
    npm run start
    ;;
  *)
    echo "❌ Unknown command: $COMMAND"
    echo "Use: ./run.sh [dev|build|start]"
    exit 1
    ;;
esac
