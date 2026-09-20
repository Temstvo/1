# Проверка без регистрации

Гостевой режим открывает настоящий кабинет без email и пароля. Создаётся обычный пользователь с ролью USER и сессией; подписка, платёж и VPN-конфигурация автоматически не выдаются. Тарифы загружаются из PostgreSQL. Чтобы сохранить гостевой аккаунт и перейти к оплате, можно добавить email и пароль в кабинете.

## На этом рабочем компьютере

Репозиторий: `C:\Users\Артём\Documents\New project 1\appi-vpn`.
Зависимости, миграции, локальные тарифы и сборки уже подготовлены. Изолированная PostgreSQL использует `127.0.0.1:55432`; секреты находятся только в игнорируемых локальных файлах.

В двух терминалах из корня репозитория:

```powershell
node scripts/guest.mjs api
```

```powershell
node scripts/guest.mjs web
```

Откройте <http://localhost:3001/demo> и нажмите «Продолжить без регистрации». API использует порт 3100; если он уже запущен в этой задаче, второй экземпляр запускать не нужно. Веб-сервер слушает только loopback.

Если PostgreSQL остановлена, запустите её перед API. Для обычного пути без кириллицы: `node scripts/local-db.mjs`. На этом Windows-компьютере уже существует ASCII-junction `C:\appi-vpn-workspace`, ведущий в репозиторий. Для существующего кластера можно запустить:

```powershell
$pgPackage = Get-ChildItem -LiteralPath 'C:\appi-vpn-workspace\node_modules\.pnpm' -Filter '@embedded-postgres+windows-x64*' | Select-Object -First 1
$pgBin = Join-Path $pgPackage.FullName 'node_modules\@embedded-postgres\windows-x64\native\bin\postgres.exe'
& $pgBin -D 'C:/appi-vpn-workspace/.local/postgres' -p 55432 -c listen_addresses=127.0.0.1
```

## На другом компьютере / существующем стенде

Нужны Node.js 22, pnpm 9.15 и PostgreSQL. Заполните `apps/backend/.env`: DATABASE_URL, два разных JWT-секрета длиной от 32 символов, FRONTEND_URL, BACKEND_URL, CORS_ORIGINS. Для гостевого входа установите `ENABLE_GUEST_ACCESS=true`. По умолчанию он выключен. Не публикуйте локальные `.env`.

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm --filter @appi/backend exec prisma generate
corepack pnpm --filter @appi/backend exec prisma migrate deploy
corepack pnpm --filter @appi/backend db:seed
corepack pnpm --filter @appi/backend build
corepack pnpm --filter @appi/frontend build
```

Запустите две команды `guest.mjs` выше. На публичном HTTPS-стенде используйте обычные production-команды, задайте точный `APP_URL=https://ваш-домен` и внутренний `API_URL=http://backend:3000/api` во frontend. Локальные команды `guest.mjs` предназначены только для разработки.

## Что проверить

- `/demo` → гостевой кабинет: нет подписки, платежей или выдуманной конфигурации.
- Тарифы совпадают с опубликованными записями БД.
- Сохранение email и пароля сохраняет тот же аккаунт; после выхода возможен обычный вход.
- Гость не получает `/admin` или VPN-конфигурацию без подписки.
- Ошибки API видны пользователю; кнопки операций блокируются на время запроса.

Без настроенных YooKassa и Marzban реальная оплата и VPN не работают. Для проверки инфраструктуры нужны собственный магазин и сервер с Reality inbound. Тесты с подменёнными провайдерами выполняются только в тестовом процессе, не включаются в гостевой режим и не подтверждают реальное сетевое VPN-соединение.

## Проверено в этой задаче, 20 сентября 2026

- Production build frontend и backend: успешно.
- Модульные тесты: 64 успешно.
- Три интеграционных сценария на отдельной PostgreSQL: успешно. Покрывают гостя, сохранение аккаунта, запрет повышения роли, отзыв сессии, replay refresh, сверку суммы, конкурентные webhook, единственный invoice, продление, шифрование конфигурации, повтор синхронизации и истечение доступа.
- Браузерная проверка не выполнена: автоматическая проверка разрешений заблокировала запуск веб-сервера без объяснения конкретной причины. Внешние YooKassa/Marzban не проверены с реальными ключами.
