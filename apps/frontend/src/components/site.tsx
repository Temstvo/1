import Link from 'next/link';
import { BrandMark, Icon } from './icon';
export function Header() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Перейти к содержимому
      </a>
      <header className="header-wrap">
        <div className="topbar">
          <Link className="brand" href="/" aria-label="Appi VPN — главная">
            <BrandMark className="brand-mark" />
            <span>
              appi<span className="brand-light">vpn</span>
              <span className="brand-dot">®</span>
            </span>
          </Link>
          <nav className="desktop-nav" aria-label="Главная навигация">
            <Link href="/#advantages">Возможности</Link>
            <Link href="/#how">Как подключиться</Link>
            <Link href="/#pricing">Тарифы</Link>
          </nav>
          <Link href="/app" className="nav-account">
            Открыть Appi <Icon name="arrow" />
          </Link>
          <details className="mobile-nav">
            <summary aria-label="Открыть меню">
              <Icon name="menu" />
            </summary>
            <nav aria-label="Мобильная навигация">
              <Link href="/app">Приложение Appi</Link>
              <Link href="/#advantages">Возможности</Link>
              <Link href="/#how">Как подключиться</Link>
              <Link href="/#pricing">Тарифы</Link>
              <Link href="/demo">
                Без регистрации <Icon name="arrow" />
              </Link>
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div>
          <Link className="brand" href="/">
            <BrandMark className="brand-mark" />
            <span>
              appi<span className="brand-light">vpn</span>
            </span>
          </Link>
          <p>
            Чуть больше свободы.
            <br />
            Каждый день.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <span>Сервис</span>
            <Link href="/#pricing">Тарифы</Link>
            <Link href="/#how">Подключение</Link>
            <Link href="/demo">Гостевой кабинет</Link>
          </div>
          <div>
            <span>На связи</span>
            <Link href="/support">
              Поддержка <Icon name="arrow" />
            </Link>
            <Link href="/guide">Настройка VPN</Link>
            <Link href="/login">Войти в аккаунт</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <small>© {new Date().getFullYear()} Appi VPN</small>
        <div>
          <Link href="/terms">Условия использования</Link>
          <Link href="/privacy">Конфиденциальность</Link>
        </div>
        <span className="footer-note">
          <span className="live-dot" /> Сделано для вашего подключения
        </span>
      </div>
    </footer>
  );
}
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main-content" className="workspace">
        {children}
      </main>
      <Footer />
    </>
  );
}
