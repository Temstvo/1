#!/bin/bash

# APPI VPN - Rollback Script
# Usage: ./scripts/rollback.sh <version>

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 v1.0.0"
  exit 1
fi

echo "========================================="
echo "APPI VPN - Rollback to $VERSION"
echo "========================================="
echo ""

echo "WARNING: This will rollback to version $VERSION!"
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

echo "[$(date)] Stopping services..."
docker-compose -f docker-compose.prod.yml down

echo "[$(date)] Checking out version $VERSION..."
git checkout "$VERSION"

echo "[$(date)] Building and starting..."
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

echo "[$(date)] Waiting for services..."
sleep 10

echo "[$(date)] Running health checks..."
./scripts/health-check.sh

echo ""
echo "[$(date)] Rollback to $VERSION completed!"
