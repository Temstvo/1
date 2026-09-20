'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { apiErrorMessage } from '@/lib/api';
import { Shell } from '@/components/site';
import { Icon } from '@/components/icon';
export default function Demo() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const router = useRouter();
  async function enter() {
    setBusy(true);
    setError('');
    try {
      try {
        await api.get('/users/me');
      } catch (e: any) {
        if (e.response?.status !== 401) throw e;
        await api.post('/auth/guest', {});
      }
      router.push('/dashboard');
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Shell>
      <div className="auth-card">
        <div className="auth-emblem">
          <Icon name="spark" />
        </div>
        <p className="eyebrow">БЕЗ ФОРМ И ПАРОЛЕЙ</p>
        <h1>Познакомьтесь с Appi.</h1>
        <p>
          Откройте настоящий гостевой кабинет: посмотрите тарифы, интерфейс подписки и настройки
          подключения.
        </p>
        <ul className="guest-benefits">
          <li>
            <Icon name="check" /> Настоящий личный кабинет
          </li>
          <li>
            <Icon name="check" /> Все опубликованные тарифы
          </li>
          <li>
            <Icon name="check" /> Можно сохранить аккаунт позже
          </li>
        </ul>
        <div className="notice">
          VPN-доступ приобретается отдельно. Добавьте email и пароль в кабинете, когда решите
          сохранить аккаунт и оплатить тариф.
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button className="button wide" disabled={busy} onClick={enter}>
          {busy ? 'Открываем кабинет…' : 'Продолжить без регистрации ↗'}
        </button>
        <p className="fine">
          Гостевой вход доступен, когда его включил владелец сервиса.{' '}
          <Link href="/#pricing">Тарифы доступны всем.</Link>
        </p>
      </div>
    </Shell>
  );
}
