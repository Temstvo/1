#!/bin/bash

# APPI VPN - Database Migration Script
# Run after deployment: ./scripts/migrate.sh

set -e

echo "========================================="
echo "APPI VPN - Database Migration"
echo "========================================="
echo ""

POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-appi_vpn}"
CONTAINER_NAME="appi-backend"

echo "[$(date)] Running Prisma migrations..."

docker exec "$CONTAINER_NAME" npx prisma migrate deploy

echo "[$(date)] Generating Prisma client..."

docker exec "$CONTAINER_NAME" npx prisma generate

echo "[$(date)] Seeding database..."

docker exec "$CONTAINER_NAME" npx prisma db seed

echo "[$(date)] Migration completed!"
