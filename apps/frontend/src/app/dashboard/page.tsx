'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { apiErrorMessage } from '@/lib/api';
import { Shell } from '@/components/site';
import Pricing, { Plan } from '@/components/pricing';
import { Icon } from '@/components/icon';
type User = { id: string; email: string; role: string; profile?: { firstName?: string } };
type Subscription = { status: string; expiresAt: string; plan: { name: string } };
type Payment = { id: string; status: string; amount: string; currency: string; createdAt: string };
const labels: Record<string, string> = {
  ACTIVE: 'Активна',
  PENDING: 'Ожидает подтверждения',
  COMPLETED: 'Оплачен',
  FAILED: 'Ошибка оплаты',
  CANCELLED: 'Отменён',
  EXPIRED: 'Срок истёк',
  REFUNDED: 'Возвращён',
  NOT_PROVISIONED: 'Доступ ещё не создан',
  DISABLED: 'Отключён',
  REVOKED: 'Доступ отозван',
  ERROR: 'Ошибка настройки',
};
export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null),
    [sub, setSub] = useState<Subscription | null>(null),
    [vpn, setVpn] = useState<{ status: string; configured: boolean } | null>(null),
    [payments, setPayments] = useState<Payment[]>([]),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [loaded, setLoaded] = useState(false),
    [config, setConfig] = useState(''),
    [message, setMessage] = useState('');
  const guest = !!user?.email.endsWith('@guest.invalid');
  async function load() {
    setError('');
    try {
      const u = await api.get('/users/me');
      setUser(u.data);
      const results = await Promise.all([
        api.get('/subscriptions/current'),
        api.get('/vpn/status'),
        api.get('/payments'),
      ]);
      setSub(results[0].data);
      setVpn(results[1].data);
      setPayments(results[2].data);
    } catch (e: any) {
      if (e.response?.status === 401) router.replace('/login');
      else setError(apiErrorMessage(e));
    } finally {
      setLoaded(true);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function claim(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const f = new FormData(e.currentTarget);
    try {
      await api.post('/auth/claim', {
        email: f.get('email'),
        password: f.get('password'),
        firstName: f.get('firstName'),
      });
      setMessage('Аккаунт сохранён. Теперь можно входить по email и паролю.');
      await load();
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function checkout(plan: Plan) {
    if (busy) return;
    if (guest) {
      setError('Сначала сохраните аккаунт: email нужен для чека и восстановления доступа.');
      document.getElementById('save-account')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setBusy(true);
    setError('');
    try {
      const storageKey = 'appi-checkout-' + plan.id;
      let key = sessionStorage.getItem(storageKey);
      if (!key) {
        key = crypto.randomUUID();
        sessionStorage.setItem(storageKey, key);
      }
      const { data } = await api.post(
        '/payments/checkout',
        { planId: plan.id },
        { headers: { 'Idempotency-Key': key } },
      );
      if (data.status !== 'PENDING') {
        sessionStorage.removeItem(storageKey);
        setMessage('Предыдущий заказ завершён. Выберите тариф ещё раз для нового заказа.');
        await load();
        return;
      }
      if (!data.confirmationUrl || new URL(data.confirmationUrl).protocol !== 'https:')
        throw new Error('Провайдер не вернул ссылку оплаты');
      window.location.assign(data.confirmationUrl);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function configs() {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.get('/vpn/configs');
      setConfig(data.subscriptionUrl || data.links?.join('\n') || '');
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      await api.post('/auth/logout');
      router.replace('/');
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Shell>
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">ЛИЧНЫЙ КАБИНЕТ</p>
          <h1>{guest ? 'Добро пожаловать, гость.' : 'Ваше подключение.'}</h1>
          <p>
            {guest
              ? 'Можно осмотреться без регистрации. VPN-доступ приобретается отдельно.'
              : user?.email}
          </p>
        </div>
        <button className="button secondary" onClick={logout} disabled={busy || !user}>
          Выйти
        </button>
      </div>
      <nav className="dashboard-nav" aria-label="Разделы кабинета">
        <a href="#access">
          <Icon name="shield" /> Мой доступ
        </a>
        <a href="#plans">
          <Icon name="spark" /> Тарифы
        </a>
        <a href="#payments">
          <Icon name="lock" /> Платежи
        </a>
        {guest && (
          <a href="#save-account">
            <Icon name="key" /> Сохранить аккаунт
          </a>
        )}
      </nav>
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {!loaded ? (
        <p role="status">Загружаем ваш кабинет…</p>
      ) : (
        <>
          <div className="dashboard-grid" id="access">
            <section className="card">
              <p className="eyebrow">
                <Icon name="spark" /> ПОДПИСКА
              </p>
              <h2>{sub?.plan.name || 'Пока без подписки'}</h2>
              <p>
                {sub ? labels[sub.status] || sub.status : 'Выберите тариф, когда будете готовы.'}
              </p>
              {sub && <p>До {new Date(sub.expiresAt).toLocaleString('ru-RU')}</p>}
              <a className="text-button" href="#plans">
                {sub ? 'Продлить подписку' : 'Посмотреть тарифы'} ↗
              </a>
            </section>
            <section className="card">
              <p className="eyebrow">
                <Icon name="shield" /> VPN-ДОСТУП
              </p>
              <h2>{vpn ? labels[vpn.status] || vpn.status : 'Статус недоступен'}</h2>
              <p>
                {vpn?.configured
                  ? 'Статус доступа обновляется после подтверждённой оплаты.'
                  : 'VPN-инфраструктура пока не настроена оператором.'}
              </p>
              <div className="actions">
                <button
                  className="button secondary"
                  disabled={busy || vpn?.status !== 'ACTIVE'}
                  onClick={configs}
                >
                  Получить конфигурацию
                </button>
                <button className="text-button" onClick={load}>
                  Обновить
                </button>
              </div>
            </section>
          </div>
          {config && (
            <section className="card">
              <h2>Ваша конфигурация</h2>
              <p>
                Импортируйте в клиент с поддержкой VLESS Reality. Не передавайте эту ссылку другим
                людям.
              </p>
              <textarea aria-label="Персональная конфигурация" readOnly value={config} />
              <button
                className="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(config);
                    setMessage('Конфигурация скопирована.');
                  } catch {
                    setError('Не удалось скопировать. Выделите текст вручную.');
                  }
                }}
              >
                Скопировать
              </button>
            </section>
          )}
          {guest && (
            <section className="card" id="save-account">
              <h2>Сохраните свой кабинет</h2>
              <p>
                Гостевой вход привязан к этому браузеру. Добавьте email и пароль, чтобы возвращаться
                с любого устройства и перейти к оплате.
              </p>
              <form className="inline-form" onSubmit={claim}>
                <label>
                  Имя
                  <input name="firstName" maxLength={50} autoComplete="given-name" />
                </label>
                <label>
                  Email
                  <input name="email" type="email" required autoComplete="email" />
                </label>
                <label>
                  Пароль
                  <input
                    name="password"
                    type="password"
                    minLength={8}
                    maxLength={128}
                    required
                    autoComplete="new-password"
                  />
                </label>
                <p className="fine">
                  От 8 символов: заглавная и строчная буквы, цифра, специальный символ @$!%*?&.
                </p>
                <button className="button" disabled={busy}>
                  Сохранить аккаунт
                </button>
              </form>
            </section>
          )}
          <section className="dashboard-section" id="plans">
            <h2>Ваш следующий период</h2>
            <p>Оставшийся оплаченный срок сохраняется при продлении.</p>
            {busy && <p role="status">Выполняем запрос…</p>}
            <Pricing choose={checkout} disabled={busy} />
          </section>
          <section className="card" id="payments">
            <h2>История платежей</h2>
            {payments.length ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Сумма</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td>{new Date(p.createdAt).toLocaleDateString('ru-RU')}</td>
                        <td>
                          {p.amount} {p.currency}
                        </td>
                        <td>
                          <Link href={'/checkout/success?paymentId=' + p.id}>
                            {labels[p.status] || p.status}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <span>
                  <Icon name="lock" />
                </span>
                <p>
                  <strong>Здесь пока тихо.</strong>Ваши платежи появятся после первого заказа.
                </p>
              </div>
            )}
          </section>
          {user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role) && (
            <Link className="button secondary" href="/admin">
              Панель управления ↗
            </Link>
          )}
        </>
      )}
    </Shell>
  );
}
