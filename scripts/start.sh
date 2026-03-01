#!/bin/sh
# scripts/start.sh

# Exit on first error
set -e

echo "Starting HomeBoard..."

echo "Pushing database schema..."
pnpm --filter @homeboard/db db:push

echo "Yielding to SQLite..."
sleep 2

echo "Starting API server..."
node apps/api/dist/index.mjs
