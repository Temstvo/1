import Link from 'next/link';
import { Shell } from '@/components/site';
export const metadata = { title: 'Подключение — Appi VPN' };
export default function Guide() {
  return (
    <Shell>
      <p className="eyebrow">НАСТРОЙКА ЗА НЕСКОЛЬКО ШАГОВ</p>
      <h1>Ваш первый VPN.</h1>
      <p>Appi выдаёт персональную подписку. Подключение включается в VPN-клиенте на устройстве.</p>
      <div className="dashboard-grid">
        <section className="card">
          <h2>01 · Установите клиент</h2>
          <p>
            Для Android, iPhone, Windows, macOS и Linux можно использовать Hiddify. Выберите свою
            платформу на официальной странице проекта.
          </p>
          <a
            className="button secondary"
            href="https://github.com/hiddify/hiddify-app#-download"
            target="_blank"
            rel="noreferrer"
          >
            Официальный Hiddify ↗
          </a>
          <p>
            Другие варианты: <a href="https://github.com/2dust/v2rayNG">v2rayNG для Android</a>,{' '}
            <a href="https://github.com/2dust/v2rayN">v2rayN для компьютера</a>.
          </p>
        </section>
        <section className="card">
          <h2>02 · Получите подписку</h2>
          <p>
            В кабинете активируйте доступ и дождитесь готовности VPN. Нажмите «Получить
            конфигурацию» и скопируйте персональную ссылку.
          </p>
          <Link href="/dashboard" className="button">
            Открыть кабинет
          </Link>
        </section>
        <section className="card">
          <h2>03 · Импортируйте ссылку</h2>
          <p>
            В клиенте добавьте профиль из буфера обмена или по URL. Вставьте ссылку и обновите
            подписку. Не отправляйте её другим людям: это ваш ключ доступа.
          </p>
          <p>
            На iPhone и Android подтвердите системный запрос на добавление VPN. На компьютере для
            всего трафика используйте VPN/TUN-режим клиента; он может запросить права
            администратора.
          </p>
        </section>
        <section className="card">
          <h2>04 · Проверьте соединение</h2>
          <p>
            Выберите доступный узел, включите подключение и откройте несколько сайтов. Проверьте
            работу через Wi-Fi и мобильную сеть. Если подключение не работает, обновите клиент и
            подписку, затем обратитесь в поддержку.
          </p>
          <Link href="/support" className="text-button">
            Помочь с подключением ↗
          </Link>
        </section>
      </div>
      <section className="notice">
        <h2>Если срок или трафик закончились</h2>
        <p>
          Продлите подписку в кабинете, дождитесь обновления доступа и обновите профиль в клиенте.
          Оплаченный оставшийся срок сохраняется при продлении. Автоматического списания нет.
        </p>
      </section>
    </Shell>
  );
}
