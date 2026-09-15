#!/bin/bash
set -e
# Oracle Cloud Always Free — 1 команда
# Запусти на инстансе (Ubuntu 22.04, VM.Standard.A1.Flex 4OCPU/24GB):
#   git clone https://github.com/Temstvo/1.git appi-vpn && cd appi-vpn
#   cp .env.oracle .env  # заполни DATABASE_URL, TELEGRAM_BOT_TOKEN
#   bash scripts/deploy-oracle.sh

ORACLE_IP=$(curl -s ifconfig.me || echo "__ORACLE_IP__")
echo "Oracle IP: $ORACLE_IP"
sed -i "s/__ORACLE_IP__/$ORACLE_IP/g" docker-compose.oracle.yml

sudo apt update && sudo apt install -y docker.io docker-compose-plugin git

# Firewall
sudo iptables -I INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 3000 -j ACCEPT
sudo netfilter-persistent save 2>/dev/null || sudo iptables-save | sudo tee /etc/iptables/rules.v4 >/dev/null || true

# Build & up
docker compose -f docker-compose.oracle.yml up -d --build

echo "Waiting for health..."
for i in {1..30}; do curl -sf http://localhost:3000/api/health && break || sleep 3; done

echo "Done. Open http://$ORACLE_IP/sub/<token> and https://t.me/AppiVPNBot"
echo "Logs: docker logs -f appi-backend && docker logs -f appi-telegram-bot"
