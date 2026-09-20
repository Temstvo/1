'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { apiErrorMessage } from '@/lib/api';
import { Shell } from './site';
export default function AuthForm({ register = false }: { register?: boolean }) {
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const f = new FormData(e.currentTarget);
    try {
      await api.post(register ? '/auth/register' : '/auth/login', {
        email: f.get('email'),
        password: f.get('password'),
        ...(register ? { firstName: f.get('firstName') } : {}),
      });
      router.push('/dashboard');
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Shell>
      <form className="auth-card" onSubmit={submit}>
        <p className="eyebrow">ВАШЕ ПРОСТРАНСТВО</p>
        <h1>{register ? 'Начните с Appi.' : 'С возвращением.'}</h1>
        <p>
          {register ? 'Создайте аккаунт и управляйте подключением.' : 'Войдите, чтобы продолжить.'}
        </p>
        {register && (
          <label>
            Имя
            <input name="firstName" autoComplete="given-name" maxLength={50} />
          </label>
        )}
        <label>
          Email
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Пароль
          <input
            name="password"
            type="password"
            required
            minLength={register ? 8 : 1}
            maxLength={128}
            autoComplete={register ? 'new-password' : 'current-password'}
          />
        </label>
        {register && (
          <p className="fine">
            От 8 символов: заглавная и строчная буквы, цифра, специальный символ @$!%*?&.
          </p>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button className="button wide" disabled={busy}>
          {busy ? 'Подождите…' : register ? 'Создать аккаунт ↗' : 'Войти ↗'}
        </button>
        <p>
          {register ? 'Уже есть аккаунт? ' : 'Впервые здесь? '}
          <Link href={register ? '/login' : '/register'}>
            {register ? 'Войти' : 'Создать аккаунт'}
          </Link>
        </p>
        <div className="auth-links">
          <Link href="/demo">Без регистрации</Link>
          <Link href="/forgot-password">Забыли пароль?</Link>
        </div>
      </form>
    </Shell>
  );
}
