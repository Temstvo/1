import Link from 'next/link';
import { Shell } from '@/components/site';
import { Icon } from '@/components/icon';
export default function NotFound() {
  return (
    <Shell>
      <div className="auth-card">
        <div className="auth-emblem">
          <Icon name="globe" />
        </div>
        <p className="eyebrow">404 · ЗДЕСЬ ПОКА ПУСТО</p>
        <h1>Кажется, мы свернули.</h1>
        <p>Такой страницы нет. Вернёмся туда, где начинается подключение.</p>
        <Link className="button" href="/">
          На главную <Icon name="arrow" />
        </Link>
        <Link className="text-button" href="/demo">
          Попробовать без регистрации <Icon name="arrow" />
        </Link>
      </div>
    </Shell>
  );
}
