#!/bin/bash

set -e # Exit immediately if a command exits with a non-zero status.

echo "🧹 Cleaning project..."
rm -rf node_modules .next
npm cache clean --force
echo "📦 Installing dependencies..."
npm install

echo "🛑 Stopping Supabase..."
supabase stop || echo "Supabase was not running."

echo "🐳 Stopping and removing any stray Supabase Docker containers..."
docker ps -a -q --filter "name=supabase_db_*" | xargs -r docker stop
docker ps -a -q --filter "name=supabase_db_*" | xargs -r docker rm -f
docker ps -a -q --filter "name=supabase_studio_*" | xargs -r docker stop
docker ps -a -q --filter "name=supabase_studio_*" | xargs -r docker rm -f
docker ps -a -q --filter "name=supabase_kong_*" | xargs -r docker stop
docker ps -a -q --filter "name=supabase_kong_*" | xargs -r docker rm -f
# Add other potential Supabase container names if needed

echo "🚀 Starting Supabase..."
supabase start

echo "⏳ Waiting for Supabase services to be ready..."
sleep 10 # Adjust sleep time if needed

echo "✅ Local environment reset successfully!"
echo "👉 You can now start the development server with: npm run dev"

# Note: npm run dev is not started automatically as it's a long-running process.
# The user is prompted to run it manually. 