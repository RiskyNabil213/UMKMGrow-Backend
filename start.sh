#!/bin/sh
echo "DATABASE_URL is: ${DATABASE_URL:0:30}..."
echo "Running migrations..."
npx prisma migrate deploy --schema=src/prisma/schema.prisma
echo "Starting app..."
node dist/src/main.js
