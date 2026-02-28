#!/bin/bash
# scripts/update.sh

# Exit on first error but don't fail loudly if no changes
set -e

echo "Starting HomeBoard update check..."

# Move to project root
cd "$(dirname "$0")/.."

# Fetch latest from tracking branch
git fetch origin main

# Get the commit hashes
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "Changes detected ($LOCAL -> $REMOTE)"
    echo "Pulling latest code..."
    git pull origin main

    echo "Rebuilding and restarting Docker containers..."
    # The API container has the docker socket mounted, but might not have docker/docker-compose installed.
    # However, since we are executing this script *from* the host (via cron) or *inside* a container
    # that has the docker CLI mapped, we assume `docker compose` is available.
    docker compose up -d --build
    
    echo "Update complete."
else
    echo "HomeBoard is already up to date ($LOCAL)."
fi
