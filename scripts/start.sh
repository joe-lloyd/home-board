#!/bin/sh
# scripts/start.sh

# Exit on first error
set -e

echo "Starting HomeBoard..."

echo "Pushing database schema..."
pnpm --filter @homeboard/db db:push

echo "Starting API server..."
node apps/api/dist/index.mjs
