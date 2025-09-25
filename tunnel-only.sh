#!/bin/bash

# Cloudflare Tunnel Only - Start Script
# This script only starts the Cloudflare tunnel (assumes Next.js is already running)

set -e

echo "🔗 Starting Cloudflare tunnel for dinkhousepb.com..."

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

# Check if local service is running on port 3000
if ! nc -z localhost 3001 2>/dev/null; then
    echo "⚠️  Warning: No service detected on localhost:3001"
    echo "   Make sure your Next.js app is running first!"
    echo ""
fi

echo "   ✓ Starting tunnel..."
cloudflared tunnel --config tunnel-config.yml run
