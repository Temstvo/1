'use client';
import Link from 'next/link';
import { Shell } from '@/components/site';
import { Icon } from '@/components/icon';
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Shell>
      <div className="auth-card">
        <div className="auth-emblem">
          <Icon name="globe" />
        </div>
        <p className="eyebrow">НЕБОЛЬШАЯ ПАУЗА</p>
        <h1>Не удалось открыть страницу.</h1>
        <p role="alert">
          Попробуйте ещё раз. Если ошибка повторяется, вернитесь на главную или свяжитесь с
          поддержкой.
        </p>
        <button className="button" onClick={reset}>
          Попробовать снова <Icon name="arrow" />
        </button>
        <Link href="/" className="text-button">
          На главную
        </Link>
      </div>
    </Shell>
  );
}
