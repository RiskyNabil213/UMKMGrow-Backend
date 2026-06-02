#!/bin/sh
echo "=== Environment Check ==="
echo "PORT: $PORT"
echo "DATABASE_URL prefix: ${DATABASE_URL:0:40}"
echo "NODE_ENV: $NODE_ENV"
echo "========================="

echo "Running migrations..."
npx prisma migrate deploy --schema=src/prisma/schema.prisma

echo "Starting app..."
node dist/src/main.js
