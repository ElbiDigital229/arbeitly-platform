#!/usr/bin/env bash
set -e

echo "==> Checking prerequisites..."

if ! command -v bun &> /dev/null; then
  echo "ERROR: bun is not installed. Install it from https://bun.sh"
  exit 1
fi

if ! command -v docker &> /dev/null; then
  echo "ERROR: docker is not installed. Install it from https://docs.docker.com/get-docker/"
  exit 1
fi

echo "==> Starting dev infrastructure (Postgres, Valkey, MinIO)..."
docker compose -f backend/dev-docker-compose.yml up -d

echo "==> Waiting for Postgres to be ready..."
sleep 3

echo "==> Installing backend dependencies..."
cd backend
bun install

echo "==> Copying .env.example to .env if not present..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "  Created backend/.env — update ANTHROPIC_API_KEY if needed."
fi

echo "==> Running database migrations..."
bun run db:migrate

echo "==> (Optional) Seeding demo data..."
bun run db:seed || true

cd ..

echo "==> Installing frontend dependencies..."
cd frontend
bun install
cd ..

echo ""
echo "================================================================"
echo "  Setup complete!"
echo "================================================================"
echo ""
echo "  Start the backend:"
echo "    cd backend && bun run dev"
echo ""
echo "  Start the frontend (new terminal):"
echo "    cd frontend && bun run dev"
echo ""
echo "  Services:"
echo "    API:          http://localhost:3000/api/health"
echo "    Frontend:     http://localhost:5173"
echo "    MinIO UI:     http://localhost:9001  (minioadmin / minioadmin)"
echo "    Prisma Studio: cd backend && bun run db:studio"
echo ""
echo "  Demo account:  demo@arbeitly.com / password123"
echo ""
