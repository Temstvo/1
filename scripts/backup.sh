#!/bin/bash

# APPI VPN - Database Backup Script
# Run daily via cron: 0 2 * * * /path/to/backup.sh

set -e

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
KEEP_DAYS=30

POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-appi_vpn}"
CONTAINER_NAME="appi-postgres"

echo "[$(date)] Starting backup..."

mkdir -p "$BACKUP_DIR"

docker exec "$CONTAINER_NAME" pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$BACKUP_DIR/${POSTGRES_DB}_${DATE}.sql.gz"

echo "[$(date)] Backup completed: ${POSTGRES_DB}_${DATE}.sql.gz"

find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$KEEP_DAYS -delete

echo "[$(date)] Old backups cleaned (kept $KEEP_DAYS days)"

TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "[$(date)] Total backup size: $TOTAL_SIZE"
