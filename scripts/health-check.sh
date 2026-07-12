#!/bin/bash

# APPI VPN - Health Check Script
# Checks all services and reports status

set -e

echo "========================================="
echo "APPI VPN - Health Check"
echo "========================================="
echo ""

check_service() {
  local name=$1
  local url=$2
  local expected=$3

  response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")

  if [ "$response" = "$expected" ]; then
    echo "✅ $name: OK ($response)"
  else
    echo "❌ $name: FAILED ($response, expected $expected)"
  fi
}

check_container() {
  local name=$1
  local status=$(docker inspect --format='{{.State.Status}}' "$name" 2>/dev/null || echo "not found")

  if [ "$status" = "running" ]; then
    echo "✅ $name: Running"
  else
    echo "❌ $name: $status"
  fi
}

echo "--- Containers ---"
check_container "appi-postgres"
check_container "appi-redis"
check_container "appi-backend"
check_container "appi-frontend"
check_container "appi-admin"
check_container "appi-nginx"
check_container "appi-prometheus"
check_container "appi-grafana"
check_container "appi-loki"
check_container "appi-telegram-bot"

echo ""
echo "--- Endpoints ---"
check_service "Frontend" "http://localhost:3001" "200"
check_service "Backend API" "http://localhost:3000/api/health" "200"
check_service "Admin Panel" "http://localhost:3002" "200"
check_service "Nginx" "http://localhost:80" "200"
check_service "Prometheus" "http://localhost:9090" "200"
check_service "Grafana" "http://localhost:3003" "200"
check_service "Loki" "http://localhost:3100" "200"

echo ""
echo "--- Disk Usage ---"
df -h / | tail -1 | awk '{print "Root: " $5 " used (" $4 " free)"}'

echo ""
echo "--- Docker Stats ---"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep "appi-"

echo ""
echo "========================================="
echo "Health check completed at $(date)"
echo "========================================="
