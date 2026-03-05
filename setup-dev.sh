#!/usr/bin/env bash
set -euo pipefail

echo "==> Starting Docker services..."
cd backend
docker compose up -d
echo "==> Waiting for Postgres to be ready..."
sleep 3

echo "==> Installing backend dependencies..."
bun install

echo "==> Running Prisma migrations..."
dotenv -e .env.development -- bunx prisma migrate dev

echo "==> Seeding database..."
dotenv -e .env.development -- bunx prisma db seed

cd ../frontend
echo "==> Installing frontend dependencies..."
bun install

echo "==> Setup complete!"
echo "    Backend:  cd backend  && bun run dev"
echo "    Frontend: cd frontend && bun run dev"
