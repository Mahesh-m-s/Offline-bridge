#!/bin/sh
set -e

echo "======================================================"
echo "[ArivuNet Docker] Starting Backend Container..."
echo "======================================================"

# Apply database migrations if database connection is configured
if [ -n "$DATABASE_URL" ] || [ -n "$DB_HOST" ]; then
  echo "[ArivuNet Docker] Checking database migrations..."
  node src/db/migrate.js || {
    echo "[ArivuNet Docker] Notice: Database migration encountered an issue, proceeding to server startup."
  }

  echo "[ArivuNet Docker] Checking database initial seed..."
  node src/db/seed.js || {
    echo "[ArivuNet Docker] Notice: Database seed encountered an issue, proceeding to server startup."
  }
fi

echo "[ArivuNet Docker] Starting server process: $@"
exec "$@"

