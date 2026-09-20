import Link from 'next/link';
export function Header() {
  return (
    <header className="topbar">
      <Link className="brand" href="/">
        <span className="brand-mark">a</span>appi<span className="brand-light">vpn</span>
      </Link>
      <nav aria-label="Главная навигация">
        <Link href="/#how">Как работает</Link>
        <Link href="/#pricing">Тарифы</Link>
        <Link href="/dashboard" className="nav-account">
          Личный кабинет ↗
        </Link>
      </nav>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <Link className="brand" href="/">
        appi<span className="brand-light">vpn</span>
      </Link>
      <p>Ваше подключение. Ваш выбор.</p>
      <div>
        <Link href="/terms">Условия</Link>
        <Link href="/privacy">Конфиденциальность</Link>
        <a href="https://t.me/AppiVPNBot" target="_blank" rel="noreferrer">
          Поддержка ↗
        </a>
      </div>
      <small>© {new Date().getFullYear()} Appi VPN</small>
    </footer>
  );
}
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="workspace">{children}</main>
      <Footer />
    </>
  );
}
