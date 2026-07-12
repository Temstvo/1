#!/bin/bash

# APPI VPN - Production Deployment Script
# Run from project root: ./scripts/deploy.sh

set -e

echo "========================================="
echo "APPI VPN - Production Deployment"
echo "========================================="
echo ""

# Check for required files
if [ ! -f ".env.production" ]; then
  echo "❌ Error: .env.production not found!"
  echo "Copy .env.production and configure it first."
  exit 1
fi

# Check for Docker
if ! command -v docker &> /dev/null; then
  echo "❌ Error: Docker is not installed!"
  exit 1
fi

if ! command -v docker-compose &> /dev/null; then
  echo "❌ Error: Docker Compose is not installed!"
  exit 1
fi

echo "[$(date)] Starting deployment..."

# Load environment
export $(cat .env.production | grep -v '^#' | xargs)

echo "[$(date)] Building images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "[$(date)] Stopping existing services..."
docker-compose -f docker-compose.prod.yml down

echo "[$(date)] Starting services..."
docker-compose -f docker-compose.prod.yml up -d

echo "[$(date)] Waiting for services to start..."
sleep 10

echo "[$(date)] Running health checks..."
./scripts/health-check.sh

echo ""
echo "========================================="
echo "[$(date)] Deployment completed!"
echo "========================================="
echo ""
echo "Frontend:  https://appi-vpn.com"
echo "Admin:     https://admin.appi-vpn.com"
echo "API:       https://api.appi-vpn.com"
echo "Grafana:   https://monitoring.appi-vpn.com"
echo ""
