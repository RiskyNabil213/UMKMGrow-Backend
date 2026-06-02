#!/bin/sh
echo "=== Environment Check ==="
echo "PORT: $PORT"
echo "DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo YES || echo NO)"
echo "DATABASE_URL prefix: ${DATABASE_URL:0:40}"
echo "========================="

if [ -n "$DATABASE_URL" ]; then
  echo "Running migrations..."
  npx prisma migrate deploy --schema=src/prisma/schema.prisma || echo "Migration failed, continuing anyway..."
else
  echo "WARNING: DATABASE_URL not set, skipping migration"
fi

echo "Starting app on port ${PORT:-8080}..."
node dist/src/main.js
