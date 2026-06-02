#!/bin/sh

echo "=== UMKM Grow Backend Starting ==="
echo "DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo YES || echo NO)"

if [ -n "$DATABASE_URL" ]; then
  echo "Resolving failed migration..."
  npx prisma migrate resolve --applied "20260525022902_init" --schema=prisma/schema.prisma 2>/dev/null || true
  npx prisma migrate resolve --applied "20260602000000_init" --schema=prisma/schema.prisma 2>/dev/null || true

  echo "Pushing schema to database..."
  npx prisma db push --schema=prisma/schema.prisma --accept-data-loss 2>/dev/null || true
fi

echo "Checking dist..."
ls -la /app/dist/src/ 2>/dev/null || echo "dist/src not found"

if [ ! -f "/app/dist/src/main.js" ]; then
  echo "dist/src/main.js not found, running build..."
  npm run build
fi

echo "Starting app on port ${PORT:-8080}..."
exec node dist/src/main.js
