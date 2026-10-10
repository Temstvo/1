# APPI VPN — Бесплатный VPN без ограничений

> Бесплатный VPN как у Sansara/Happ: сотни серверов, без оплат и лимитов. Ключи выдаёт Telegram-бот, подключение — через open-source [Amnezia](https://amnezia.org).

[![Telegram Bot](https://img.shields.io/badge/Telegram-@AppiVPNBot-2CA5E0?style=flat&logo=telegram)](https://t.me/AppiVPNBot)
[![Amnezia](https://img.shields.io/badge/Amnezia-VPN-3b82ff?style=flat)](https://amnezia.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🛍️ Stores — Скачать Amnezia

| iOS                                                                                                                                                                 | Android                                                                                                                                                                               | Desktop / Linux                                                                                                                   | Mirror                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [![App Store](https://img.shields.io/badge/App_Store-0D96F6?style=for-the-badge&logo=apple&logoColor=white)](https://apps.apple.com/us/app/amneziavpn/id1600529900) | [![Google Play](https://img.shields.io/badge/Google_Play-414141?style=for-the-badge&logo=google-play&logoColor=white)](https://play.google.com/store/apps/details?id=org.amnezia.vpn) | [Релизы GitHub](https://github.com/amnezia-vpn/amnezia-client/releases/latest) (exe/pkg/run) · [amnezia.org](https://amnezia.org) | [storage.googleapis.com mirror](https://storage.googleapis.com/amnezia/amnezia.org) |

## 📥 Как подключить — 3 шага

1. **Открой бота** → [@AppiVPNBot](https://t.me/AppiVPNBot) → нажми **🔑 Ключи Amnezia**
2. **Установи Amnezia** — ссылки выше (iOS/Android/Desktop, open-source)
3. **Вставь ключ** в Amnezia → «Insert the key» → `vless://...` → Continue → Connect

Amnezia не импортирует URL-подписки — бот выдаёт отдельные `vless://`-ключи. Ссылка-подписка `http://192.168.1.48:3000/sub/<token>` остаётся для sing-box/v2rayN/Clash/Happ.

## 🗂️ Репозиторий

```
appi-vpn/
├── apps/
│   ├── backend/        # API + подписка + проверка 2ip (NestJS, Prisma, 192.168.1.48:3000)
│   ├── telegram-bot/   # Бот @AppiVPNBot (ключи Amnezia + персональные ссылки)
│   ├── frontend/       # Лендинг (Next.js) — Amnezia
│   └── admin/          # Админка (опционально)
├── serv-configs/       # 31 JSON с рабочими серверами (твои, проверяются через 2ip)
│   ├── desktop/        # 243 VLESS Reality/xhttp
│   └── sickok/         # 8 MikuVPN
├── packages/           # ui, shared, sdk, configs
└── docker/             # compose, monitoring
```

## 🚀 Быстрый старт

```bash
pnpm install
cp apps/backend/.env.example apps/backend/.env  # DATABASE_URL, JWT_*, BACKEND_URL=http://192.168.1.48:3000, SUB_LINK_BASE_URL=...
pnpm --filter @appi/backend prisma migrate dev
pnpm dev  # backend 3000 + bot + frontend 3001
```

## 👩‍🏫 Community

| Платформа | Ссылка                                       |
| --------- | -------------------------------------------- |
| Telegram  | [@AppiVPNBot](https://t.me/AppiVPNBot)       |
| Amnezia   | [t.me/amnezia_vpn](https://t.me/amnezia_vpn) |

## 📄 Лицензия

MIT — как у Amnezia VPN. См. [LICENSE](LICENSE).
