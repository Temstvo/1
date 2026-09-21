'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shell } from '@/components/site';
import api, { apiErrorMessage } from '@/lib/api';

type Ticket = {
  id: string;
  subject: string;
  status: string;
  user?: { email: string };
  messages?: { id: string; message: string; isStaff: boolean; createdAt: string }[];
};
const statuses: Record<string, string> = {
  OPEN: 'Открыто',
  IN_PROGRESS: 'В работе',
  WAITING: 'Есть ответ',
  RESOLVED: 'Решено',
  CLOSED: 'Закрыто',
};
export default function Support() {
  const [tickets, setTickets] = useState<Ticket[]>([]),
    [active, setActive] = useState<Ticket | null>(null);
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [signedIn, setSignedIn] = useState(false),
    [staff, setStaff] = useState(false),
    [loaded, setLoaded] = useState(false);
  async function load() {
    try {
      const { data: user } = await api.get('/users/me');
      setSignedIn(true);
      const isStaff = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
      setStaff(isStaff);
      const { data } = await api.get(isStaff ? '/support/admin/tickets' : '/support/tickets');
      setTickets(data);
    } catch (e: any) {
      if (e.response?.status !== 401) setError(apiErrorMessage(e));
    } finally {
      setLoaded(true);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function open(id: string) {
    setBusy(true);
    setError('');
    try {
      setActive((await api.get('/support/tickets/' + id)).data);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function submit(e: React.FormEvent<HTMLFormElement>, reply = false) {
    e.preventDefault();
    const form = e.currentTarget,
      data = new FormData(form);
    setBusy(true);
    setError('');
    try {
      const path = reply ? `/support/tickets/${active!.id}/messages` : '/support/tickets';
      const result = await api.post(path, {
        message: data.get('message'),
        ...(reply ? {} : { subject: data.get('subject') }),
      });
      form.reset();
      await load();
      await open(reply ? active!.id : result.data.id);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function resolve() {
    if (!active) return;
    setBusy(true);
    try {
      await api.post(`/support/tickets/${active.id}/status`, { status: 'RESOLVED' });
      await open(active.id);
      await load();
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Shell>
      <p className="eyebrow">МЫ НА СВЯЗИ</p>
      <h1>Поддержка Appi.</h1>
      <p>
        Опишите проблему, устройство и время ошибки. Для возврата укажите номер заказа из истории
        платежей. Пароли и VPN-ключи отправлять не нужно.
      </p>
      <p>
        <Link href="/guide" className="text-button">
          Инструкция по подключению ↗
        </Link>
      </p>
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      {!loaded ? (
        <p role="status">Загружаем обращения…</p>
      ) : !signedIn ? (
        <section className="card">
          <h2>Войдите, чтобы написать</h2>
          <p>Обращения и ответы сохраняются в аккаунте.</p>
          <Link className="button" href="/login">
            Войти
          </Link>{' '}
          <Link href="/forgot-password">Забыли пароль?</Link>
        </section>
      ) : (
        <div className="dashboard-grid">
          <section className="card">
            <h2>{staff ? 'Очередь поддержки' : 'Ваши обращения'}</h2>
            <button className="button secondary" onClick={load} disabled={busy}>
              Обновить
            </button>
            {!tickets.length && <p>Открытых обращений пока нет.</p>}
            {tickets.map((t) => (
              <p key={t.id}>
                <button className="button secondary" onClick={() => open(t.id)} disabled={busy}>
                  {t.subject} · {statuses[t.status]}
                </button>
                {t.user && <small>{t.user.email}</small>}
              </p>
            ))}
            {!staff && (
              <form className="form" onSubmit={(e) => submit(e)}>
                <h3>Новое обращение</h3>
                <label>
                  Тема
                  <input name="subject" required minLength={3} maxLength={150} />
                </label>
                <label>
                  Сообщение
                  <textarea name="message" required minLength={5} maxLength={4000} rows={5} />
                </label>
                <button className="button" disabled={busy}>
                  Отправить
                </button>
              </form>
            )}
          </section>
          <section className="card">
            {active ? (
              <>
                <p className="eyebrow">{statuses[active.status]}</p>
                <h2>{active.subject}</h2>
                {active.messages?.map((m) => (
                  <article key={m.id} className="notice">
                    <small>
                      {m.isStaff ? 'Поддержка Appi' : 'Клиент'} ·{' '}
                      {new Date(m.createdAt).toLocaleString('ru-RU')}
                    </small>
                    <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{m.message}</p>
                  </article>
                ))}
                <form className="form" onSubmit={(e) => submit(e, true)}>
                  <label>
                    Ответ
                    <textarea name="message" required maxLength={4000} rows={4} />
                  </label>
                  <button className="button" disabled={busy}>
                    Отправить ответ
                  </button>
                </form>
                {staff && (
                  <button className="button secondary" disabled={busy} onClick={resolve}>
                    Отметить решённым
                  </button>
                )}
              </>
            ) : (
              <>
                <h2>Вся переписка — здесь</h2>
                <p>
                  Выберите обращение или создайте новое. Ответ появится в этом разделе после
                  обработки оператором.
                </p>
              </>
            )}
          </section>
        </div>
      )}
    </Shell>
  );
}
