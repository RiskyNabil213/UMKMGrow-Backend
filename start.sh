#!/bin/sh
set -e

echo "=== UMKM Grow Backend Starting ==="
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo YES || echo NO)"

if [ -n "$DATABASE_URL" ]; then
  echo "Resolving any failed migrations..."
  npx prisma migrate resolve --applied 20260525022902_init --schema=prisma/schema.prisma 2>/dev/null || true

  echo "Running migrations..."
  npx prisma migrate deploy --schema=prisma/schema.prisma || echo "WARNING: Migration failed, app will still start"
else
  echo "WARNING: DATABASE_URL not set, skipping migration"
fi

echo "Starting app..."
exec node dist/src/main.js
