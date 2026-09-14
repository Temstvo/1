# APPI VPN — Бесплатный VPN без ограничений

> Бесплатный VPN как у Sansara/Happ: сотни серверов, без оплат и лимитов. Подписка выдаётся Telegram-ботом, подключение — через [Happ](https://happ.su).

[![Telegram Bot](https://img.shields.io/badge/Telegram-@AppiVPNBot-2CA5E0?style=flat&logo=telegram)](https://t.me/AppiVPNBot)
[![Happ](https://img.shields.io/badge/Happ-Proxy-3b82ff?style=flat)](https://happ.su)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🛍️ Stores — Скачать Happ

| iOS                                                                                                                                                                         | Android                                                                                                                                                                             | Desktop                                                                                                                                                                                                           | TV                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [![App Store](https://img.shields.io/badge/App_Store-0D96F6?style=for-the-badge&logo=apple&logoColor=white)](https://apps.apple.com/us/app/happ-proxy-utility/id6504287215) | [![Google Play](https://img.shields.io/badge/Google_Play-414141?style=for-the-badge&logo=google-play&logoColor=white)](https://play.google.com/store/apps/details?id=com.happproxy) | Windows [x64](https://github.com/Happ-proxy/happ-desktop/releases/latest/download/setup-Happ.x64.exe) · macOS [dmg](https://github.com/Happ-proxy/happ-desktop/releases/latest/download/Happ.macOS.universal.dmg) | [Android TV](https://play.google.com/store/apps/details?id=com.happproxy)        |
| [TestFlight](https://testflight.apple.com/join/XMls6Ckd)                                                                                                                    | [APK](https://github.com/Happ-proxy/happ-android/releases/latest/download/Happ.apk)                                                                                                 | Linux [deb](https://github.com/Happ-proxy/happ-desktop/releases/latest/download/Happ.linux.x64.deb) · [rpm](https://github.com/Happ-proxy/happ-desktop/releases/latest/download/Happ.linux.x64.rpm)               | [Apple TV](https://apps.apple.com/us/app/happ-proxy-utility-for-tv/id6748297274) |

## 📥 Как подключить — 3 шага

1. **Открой бота** → [@AppiVPNBot](https://t.me/AppiVPNBot) → нажми **🚀 Импорт в Happ**
2. **Установи Happ** — ссылки выше (iOS/Android/Desktop)
3. **Вставь подписку** в Happ → `+` → `Из буфера` → подключись

Подписка — одна персональная ссылка вида `http://192.168.1.48:3000/sub/<token>` (как `https://sub.allcrash.ru/...`), автообновление каждый час.

## 🗂️ Репозиторий

```
appi-vpn/
├── apps/
│   ├── backend/        # API + подписка + проверка 2ip (NestJS, Prisma, 192.168.1.48:3000)
│   ├── telegram-bot/   # Бот @AppiVPNBot (только Happ, персональные ссылки)
│   ├── frontend/       # Лендинг как happ.su (Next.js, / — Happ-only)
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

| Платформа | Ссылка                                   |
| --------- | ---------------------------------------- |
| Telegram  | [@AppiVPNBot](https://t.me/AppiVPNBot)   |
| Happ Chat | [t.me/happ_chat](https://t.me/happ_chat) |

## 📄 Лицензия

MIT — как у Happ. См. [LICENSE](LICENSE).
