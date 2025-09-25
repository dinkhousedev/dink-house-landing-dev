#!/bin/bash

# Dink House Landing - Cloudflare Tunnel Startup Script
# This script starts the Next.js development server and Cloudflare tunnel

set -e

echo "🚀 Starting Dink House Landing with Cloudflare Tunnel..."

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down services..."
    if [ ! -z "$NEXTJS_PID" ]; then
        kill $NEXTJS_PID 2>/dev/null || true
        echo "   ✓ Next.js server stopped"
    fi
    if [ ! -z "$TUNNEL_PID" ]; then
        kill $TUNNEL_PID 2>/dev/null || true
        echo "   ✓ Cloudflare tunnel stopped"
    fi
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared is not installed or not in PATH"
    exit 1
fi

# Check if tunnel config exists
if [ ! -f "tunnel-config.yml" ]; then
    echo "❌ tunnel-config.yml not found in current directory"
    exit 1
fi

# Check if credentials file exists
CREDS_FILE="/home/timc/.cloudflared/51411762-21ab-416b-a174-fe943fa9678c.json"
if [ ! -f "$CREDS_FILE" ]; then
    echo "❌ Tunnel credentials file not found: $CREDS_FILE"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🌐 Starting Next.js development server..."
npm run dev &
NEXTJS_PID=$!

# Wait a moment for Next.js to start
sleep 5

# Check if Next.js started successfully
if ! kill -0 $NEXTJS_PID 2>/dev/null; then
    echo "❌ Failed to start Next.js development server"
    exit 1
fi

echo "   ✓ Next.js server started (PID: $NEXTJS_PID)"

echo "🔗 Starting Cloudflare tunnel..."
cloudflared tunnel --config tunnel-config.yml run &
TUNNEL_PID=$!

# Wait a moment for tunnel to start
sleep 3

# Check if tunnel started successfully
if ! kill -0 $TUNNEL_PID 2>/dev/null; then
    echo "❌ Failed to start Cloudflare tunnel"
    exit 1
fi

echo "   ✓ Cloudflare tunnel started (PID: $TUNNEL_PID)"
echo ""
echo "🎉 Services are running!"
echo "   📱 Local:  http://localhost:3000"
echo "   🌍 Public: https://dinkhousepb.com"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for both processes
wait $NEXTJS_PID $TUNNEL_PID
