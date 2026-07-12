#!/bin/bash

# APPI VPN - Restore Script
# Usage: ./restore.sh <backup_file>

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <backup_file.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-appi_vpn}"
CONTAINER_NAME="appi-postgres"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "WARNING: This will overwrite the current database!"
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

echo "[$(date)] Stopping backend..."
docker stop appi-backend 2>/dev/null || true

echo "[$(date)] Restoring from: $BACKUP_FILE"
gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"

echo "[$(date)] Starting backend..."
docker start appi-backend

echo "[$(date)] Restore completed successfully!"
