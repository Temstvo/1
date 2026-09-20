'use client';
import { useState } from 'react';
import Link from 'next/link';
import api, { apiErrorMessage } from '@/lib/api';
import { Shell } from './site';
export default function RecoveryForm({
  mode,
}: {
  mode: 'forgot-password' | 'reset-password' | 'verify-email';
}) {
  const [error, setError] = useState(''),
    [done, setDone] = useState(false),
    [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const f = new FormData(e.currentTarget),
      token = new URLSearchParams(window.location.search).get('token');
    try {
      await api.post(
        '/auth/' + mode,
        mode === 'forgot-password'
          ? { email: f.get('email') }
          : mode === 'reset-password'
            ? { token, password: f.get('password') }
            : { token },
      );
      setDone(true);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Shell>
      <form className="auth-card" onSubmit={submit}>
        <p className="eyebrow">ДОСТУП К АККАУНТУ</p>
        <h1>{mode === 'verify-email' ? 'Подтвердите email.' : 'Восстановите доступ.'}</h1>
        {done ? (
          <>
            <p role="status">
              {mode === 'forgot-password'
                ? 'Если этот email зарегистрирован, мы отправим письмо для восстановления.'
                : mode === 'verify-email'
                  ? 'Email подтверждён.'
                  : 'Пароль изменён. Войдите с новым паролем.'}
            </p>
            <Link className="button" href="/login">
              Перейти ко входу
            </Link>
          </>
        ) : (
          <>
            {mode === 'forgot-password' && (
              <label>
                Email
                <input name="email" type="email" required autoComplete="email" />
              </label>
            )}
            {mode === 'reset-password' && (
              <>
                <label>
                  Новый пароль
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                  />
                </label>
                <p className="fine">
                  Заглавная и строчная буквы, цифра, специальный символ @$!%*?&.
                </p>
              </>
            )}
            {mode === 'verify-email' && (
              <p>Нажмите кнопку, чтобы подтвердить адрес по ссылке из письма.</p>
            )}
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <button className="button" disabled={busy}>
              {busy
                ? 'Подождите…'
                : mode === 'verify-email'
                  ? 'Подтвердить email'
                  : mode === 'reset-password'
                    ? 'Сохранить пароль'
                    : 'Отправить ссылку'}
            </button>
          </>
        )}
      </form>
    </Shell>
  );
}
