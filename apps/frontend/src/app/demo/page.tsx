'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { apiErrorMessage } from '@/lib/api';
import { Shell } from '@/components/site';
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
      } catch {
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
        <p className="eyebrow">БЕЗ ФОРМ И ПАРОЛЕЙ</p>
        <h1>Познакомьтесь с Appi.</h1>
        <p>
          Откройте настоящий гостевой кабинет: посмотрите тарифы, интерфейс подписки и настройки
          подключения.
        </p>
        <div className="notice">
          Гостевой вход не активирует VPN и не имитирует оплату. Чтобы сохранить доступ к аккаунту и
          оплатить тариф, добавьте email и пароль в кабинете.
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
