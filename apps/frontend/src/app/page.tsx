import Link from 'next/link';
import { Header, Footer } from '@/components/site';
import { Icon, IconName } from '@/components/icon';
import Pricing from '@/components/pricing';
import ConnectionVisual from '@/components/connection-visual';
import DeviceGuide from '@/components/device-guide';
const features: { icon: IconName; title: string; body: string; tag: string }[] = [
  {
    icon: 'shield',
    title: 'Личное — остаётся личным.',
    body: 'VLESS Reality защищает соединение между вашим устройством и VPN-сервером.',
    tag: 'VLESS REALITY',
  },
  {
    icon: 'key',
    title: 'Ваш доступ. Только ваш.',
    body: 'Персональная конфигурация привязана к аккаунту. Она всегда под рукой в кабинете.',
    tag: 'ПЕРСОНАЛЬНАЯ КОНФИГУРАЦИЯ',
  },
  {
    icon: 'spark',
    title: 'Без неприятных сюрпризов.',
    body: 'Стоимость и срок известны до оплаты. Продлевайте подписку, когда это нужно вам.',
    tag: 'БЕЗ АВТОСПИСАНИЙ',
  },
];
const questions = [
  [
    'Можно попробовать без регистрации?',
    'Да. Откройте гостевой кабинет, посмотрите реальные тарифы и интерфейс управления. Гостевой вход не активирует VPN. Для оплаты сохраните аккаунт, добавив email и пароль.',
  ],
  [
    'Как подключить VPN?',
    'После подтверждённой оплаты конфигурация появится в кабинете. Установите клиент с поддержкой VLESS Reality и импортируйте персональную ссылку. Затем включите подключение в клиенте.',
  ],
  [
    'Подойдёт ли моё устройство?',
    'Сервис использует VLESS Reality. Нужен совместимый VPN-клиент для Windows, macOS, Linux, Android или iOS. Сам сайт управляет доступом, а подключение выполняет установленное приложение.',
  ],
  [
    'Что будет, когда закончится подписка?',
    'Доступ истекает на VPN-сервере. При продлении к подписке добавляется оплаченный период, а оставшееся оплаченное время сохраняется.',
  ],
  [
    'Будут автоматические списания?',
    'Нет. Вы самостоятельно выбираете и оплачиваете следующий период. Сохранение аккаунта или гостевой вход не создают платёж.',
  ],
];
export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content" className="landing">
        <section className="hero section">
          <div className="hero-copy">
            <div className="hero-badge">
              <span className="live-dot" /> ВАШ ИНТЕРНЕТ. ВАШИ ПРАВИЛА.
            </div>
            <h1>
              Больше свободы.
              <br />
              Меньше{' '}
              <span className="hero-emphasis">
                границ.
                <svg viewBox="0 0 370 15" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M3 10Q170-4 366 7" />
                </svg>
              </span>
            </h1>
            <p className="hero-sub">
              Всё, что нужно для личного подключения.
              <br className="desktop-break" /> Понятная подписка. Ваши устройства. Один Appi.
            </p>
            <div className="actions">
              <Link href="/demo" className="button">
                Попробовать без регистрации <Icon name="arrow" />
              </Link>
              <Link href="#pricing" className="button secondary">
                Выбрать тариф
              </Link>
            </div>
            <p className="hero-fine">
              <Icon name="check" /> Знакомство с кабинетом — без email и карты
            </p>
            <div className="hero-meta">
              <span>
                <Icon name="shield" />
                VLESS Reality
              </span>
              <span>
                <Icon name="device" />5 платформ
              </span>
              <span>Без автосписаний</span>
            </div>
          </div>
          <ConnectionVisual />
        </section>
        <div className="platform-strip">
          <span>Рядом. На любом экране.</span>
          <div>
            <strong>Windows</strong>
            <strong>macOS</strong>
            <strong>iOS</strong>
            <strong>Android</strong>
            <strong>Linux</strong>
          </div>
          <span className="platform-note">
            Через совместимый VPN-клиент <Icon name="arrow" />
          </span>
        </div>
        <section className="section advantages" id="advantages">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">
                <span className="section-index">01 /</span> МЕНЬШЕ ЛИШНЕГО
              </p>
              <h2>
                Хороший VPN.
                <br />
                <em>Всё просто.</em>
              </h2>
            </div>
            <p>
              Технологии могут быть сложными.
              <br />
              Ваш ежедневный опыт — нет.
            </p>
          </div>
          <div className="features">
            {features.map((f, i) => (
              <article className={'feature feature-' + i} key={f.title}>
                <div className="feature-top">
                  <span className="feature-icon">
                    <Icon name={f.icon} />
                  </span>
                  <span className="feature-number">0{i + 1}</span>
                </div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
                <span className="feature-tag">{f.tag}</span>
              </article>
            ))}
          </div>
        </section>
        <section className="how-section section" id="how">
          <div className="how-heading">
            <p className="eyebrow">
              <span className="section-index">02 /</span> ПРОСТО НАЧАТЬ
            </p>
            <h2>
              От первого клика
              <br />
              <em>до подключения.</em>
            </h2>
            <p>
              Четыре понятных шага.
              <br />
              Всё остальное — в вашем кабинете.
            </p>
            <Link className="text-button" href="/demo">
              Посмотреть, как устроен кабинет <Icon name="arrow" />
            </Link>
            <div className="how-decoration" aria-hidden="true">
              <Icon name="globe" />
              <span>МЕНЬШЕ ГРАНИЦ</span>
              <Icon name="arrow" />
            </div>
          </div>
          <ol className="steps">
            {[
              [
                'Откройте кабинет',
                'Начните без регистрации. Добавьте email и пароль, когда решите сохранить аккаунт.',
              ],
              [
                'Выберите свой тариф',
                'Определитесь со сроком и объёмом трафика. Все условия видны заранее.',
              ],
              [
                'Оплатите через ЮKassa',
                'Подписка активируется после подтверждения оплаты платёжным провайдером.',
              ],
              [
                'Подключите устройство',
                'Импортируйте персональную ссылку в совместимый VPN-клиент. Готово к подключению.',
              ],
            ].map(([h, p], i) => (
              <li key={h}>
                <span className="step-number">0{i + 1}</span>
                <div>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </div>
                <Icon name="arrow" />
              </li>
            ))}
          </ol>
        </section>
        <DeviceGuide />
        <section className="section pricing-section" id="pricing">
          <div className="section-heading centered">
            <p className="eyebrow">
              <span className="section-index">04 /</span> ВАШ ПЛАН НА СВОБОДУ
            </p>
            <h2>
              Подписка под <em>ваш ритм.</em>
            </h2>
            <p>Прозрачная цена. Никаких автоматических продлений.</p>
          </div>
          <Pricing />
          <p className="pricing-footnote">
            <Icon name="lock" /> Оплата через ЮKassa <span>·</span> Оставшийся срок сохраняется при
            продлении
          </p>
        </section>
        <section className="section faq" id="faq">
          <div>
            <p className="eyebrow">
              <span className="section-index">05 /</span> РАЗБЕРЁМСЯ ВМЕСТЕ
            </p>
            <h2>
              Остались
              <br />
              <em>вопросы?</em>
            </h2>
            <p>
              Самое важное — здесь.
              <br />
              Остальное можно спросить у нас.
            </p>
            <a
              className="text-button"
              href="https://t.me/AppiVPNBot"
              target="_blank"
              rel="noreferrer"
            >
              Написать в Telegram <Icon name="arrow" />
            </a>
          </div>
          <div className="faq-list">
            {questions.map(([q, a], i) => (
              <details key={q} name="questions">
                <summary>
                  <span className="faq-index">0{i + 1}</span>
                  <span>{q}</span>
                  <span className="faq-plus">+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="closing section">
          <div className="closing-orbit" aria-hidden="true" />
          <div>
            <p className="eyebrow">МАЛЕНЬКИЙ ШАГ. БОЛЬШЕ ВОЗМОЖНОСТЕЙ.</p>
            <h2>
              Ваш интернет.
              <br />
              <em>На ваших условиях.</em>
            </h2>
            <p>Начните с кабинета. Без регистрации и обязательств.</p>
            <Link className="button" href="/demo">
              Попробовать Appi <Icon name="arrow" />
            </Link>
          </div>
          <span className="closing-symbol" aria-hidden="true">
            ↗
          </span>
        </section>
      </main>
      <Footer />
    </>
  );
}
