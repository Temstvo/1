import Link from 'next/link';
import { Header, Footer } from '@/components/site';
import Pricing from '@/components/pricing';
export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="hero section">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="live-dot" /> ПРОСТО. ПРИВАТНО. APPI.
            </div>
            <h1>
              Больше свободы.
              <br />
              <em>Меньше границ.</em>
            </h1>
            <p className="hero-sub">
              VPN-сервис с быстрым и безопасным подключением. Персональная конфигурация, понятная
              подписка и всё необходимое в одном кабинете.
            </p>
            <div className="actions">
              <Link href="/register" className="button">
                Получить VPN <span>↗</span>
              </Link>
              <Link href="/#how" className="button secondary">
                Как это работает
              </Link>
            </div>
            <Link href="/demo" className="demo-link">
              Попробовать без регистрации →
            </Link>
            <div className="hero-meta">
              <span>VLESS Reality</span>
              <span>Без автосписаний</span>
              <span>Ваши устройства</span>
            </div>
          </div>
          <div className="orbit-scene" aria-label="Иллюстрация защищённого соединения">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit orbit-three" />
            <div className="orb">
              <span>a</span>
            </div>
            <div className="floating-label top">↗ Персональное подключение</div>
            <div className="floating-label bottom">
              <span className="live-dot" /> Одна ссылка. Ваш доступ.
            </div>
            <span className="scene-caption">СВОБОДА БЫТЬ НА СВЯЗИ</span>
          </div>
        </section>
        <section className="platform-strip">
          <span>Подключайтесь через совместимый клиент</span>
          <strong>Windows</strong>
          <strong>macOS</strong>
          <strong>Linux</strong>
          <strong>Android</strong>
          <strong>iOS</strong>
        </section>
        <section className="section" id="advantages">
          <div className="section-heading">
            <p className="eyebrow">МЕНЬШЕ ЛИШНЕГО</p>
            <h2>
              Технологии сложные.
              <br />
              Подключение — простое.
            </h2>
          </div>
          <div className="features">
            {[
              [
                '01',
                'Персональный доступ',
                'Конфигурация создаётся для вашего аккаунта на управляемом VPN-сервере.',
              ],
              [
                '02',
                'Защищённое соединение',
                'VLESS Reality помогает защитить соединение между вашим устройством и сервером.',
              ],
              [
                '03',
                'Все привычные устройства',
                'Импортируйте подписку в совместимый клиент, например Happ. Установка приложения потребуется отдельно.',
              ],
              [
                '04',
                'Всё под контролем',
                'Срок подписки, история платежей и конфигурация всегда доступны в личном кабинете.',
              ],
            ].map(([n, h, p]) => (
              <article className="feature" key={n}>
                <span className="feature-number">{n} /</span>
                <h3>{h}</h3>
                <p>{p}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="section how-section" id="how">
          <div>
            <p className="eyebrow">ОТ АККАУНТА ДО ПОДКЛЮЧЕНИЯ</p>
            <h2>
              Четыре шага.
              <br />
              <em>И вы на связи.</em>
            </h2>
            <Link className="text-button" href="/demo">
              Посмотреть кабинет без регистрации ↗
            </Link>
          </div>
          <ol className="steps">
            {[
              [
                'Создайте аккаунт',
                'Или начните с гостевого кабинета — без пароля и формы регистрации.',
              ],
              ['Выберите тариф', 'Стоимость и срок известны до оплаты.'],
              [
                'Оплатите через ЮKassa',
                'Подписка активируется после подтверждения платежа провайдером.',
              ],
              [
                'Импортируйте конфигурацию',
                'Скопируйте ссылку в совместимый VPN-клиент и подключитесь.',
              ],
            ].map(([h, p], i) => (
              <li key={h}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className="section" id="pricing">
          <div className="section-heading centered">
            <p className="eyebrow">ПОНЯТНАЯ ПОДПИСКА</p>
            <h2>Выберите свой ритм.</h2>
            <p>Один платёж. Прозрачный срок. Продление, когда нужно вам.</p>
          </div>
          <Pricing />
        </section>
        <section className="section faq">
          <div>
            <p className="eyebrow">ЕСТЬ ВОПРОСЫ?</p>
            <h2>Давайте разберёмся.</h2>
          </div>
          <div>
            {[
              [
                'Можно попробовать без регистрации?',
                'Да. Кнопка «Попробовать без регистрации» открывает гостевой кабинет. Он показывает реальные тарифы и состояние временного аккаунта. Гостевой вход сам по себе не создаёт оплаченную подписку или VPN-доступ.',
              ],
              [
                'Как подключиться?',
                'После подтверждённой оплаты конфигурация появится в кабинете. Установите клиент с поддержкой VLESS Reality, например Happ, и импортируйте персональную ссылку.',
              ],
              [
                'Что происходит после окончания подписки?',
                'Доступ истекает на VPN-сервере. Оплата продления добавляет срок; оставшееся оплаченное время сохраняется.',
              ],
              [
                'VPN уже работает в браузере?',
                'Нет. Кабинет управляет подпиской и конфигурацией. Для VPN-подключения требуется отдельный совместимый клиент.',
              ],
              [
                'Будут автоматические списания?',
                'Нет. Каждый новый срок оплачивается отдельным платежом по вашему запросу.',
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span>+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="closing section">
          <p className="eyebrow">ВАШ СЛЕДУЮЩИЙ ШАГ</p>
          <h2>Откройте свой кабинет.</h2>
          <Link className="button" href="/demo">
            Попробовать без регистрации ↗
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
