'use client';
import { useEffect, useState } from 'react';
import api, { apiErrorMessage } from '@/lib/api';
import { Shell } from '@/components/site';
type Overview = {
  total: number;
  users: { id: string; email: string; role: string; status: string }[];
  payments: {
    id: string;
    amount: string;
    currency: string;
    status: string;
    user: { email: string };
  }[];
  subscriptions: {
    id: string;
    status: string;
    expiresAt: string;
    user: { email: string };
    plan: { name: string };
  }[];
  vpn: { userId: string; status: string; lastError: string | null }[];
  errors: { id: string; action: string; createdAt: string }[];
};
export default function Admin() {
  const [data, setData] = useState<Overview | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [page, setPage] = useState(1);
  async function load() {
    setBusy(true);
    setError('');
    try {
      setData((await api.get('/admin/overview?page=' + page)).data);
    } catch (e) {
      setData(null);
      setError(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void load();
  }, [page]);
  async function action(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (
      !window.confirm(
        'Применить действие «' + f.get('action') + '» к пользователю ' + f.get('userId') + '?',
      )
    )
      return;
    setBusy(true);
    setError('');
    try {
      await api.post('/admin/users/' + f.get('userId') + '/action', {
        action: f.get('action'),
        reason: f.get('reason'),
        ...(f.get('days') ? { days: Number(f.get('days')) } : {}),
        ...(f.get('planId') ? { planId: f.get('planId') } : {}),
      });
      await load();
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Shell>
      <div className="dashboard-heading">
        <h1>Управление сервисом</h1>
        <button className="button secondary" disabled={busy} onClick={load}>
          Обновить
        </button>
      </div>
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      {data && (
        <>
          <section className="card">
            <h2>Пользователи · {data.total}</h2>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Роль</th>
                    <th>Статус</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.status}</td>
                      <td>{u.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="actions">
              <button
                className="text-button"
                disabled={page === 1 || busy}
                onClick={() => setPage(page - 1)}
              >
                ← Назад
              </button>
              <span>{page}</span>
              <button
                className="text-button"
                disabled={page * 50 >= data.total || busy}
                onClick={() => setPage(page + 1)}
              >
                Далее →
              </button>
            </div>
          </section>
          <section className="card">
            <h2>Действие с доступом</h2>
            <form className="inline-form" onSubmit={action}>
              <label>
                Пользователь
                <select name="userId" required>
                  {data.users
                    .filter((u) => u.role === 'USER')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.email}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Действие
                <select name="action">
                  <option value="block">Заблокировать</option>
                  <option value="unblock">Разблокировать</option>
                  <option value="revoke">Отозвать VPN</option>
                  <option value="restore">Восстановить VPN</option>
                  <option value="extend">Продлить вручную</option>
                </select>
              </label>
              <label>
                Причина
                <input name="reason" required minLength={3} maxLength={300} />
              </label>
              <label>
                Дни (для продления)
                <input name="days" type="number" min={1} max={366} />
              </label>
              <label>
                ID тарифа (для новой подписки)
                <input name="planId" />
              </label>
              <button className="button" disabled={busy}>
                Применить
              </button>
            </form>
          </section>
          <section className="card">
            <h2>Последние платежи</h2>
            {data.payments.length ? (
              <div className="table-scroll">
                <table>
                  <tbody>
                    {data.payments.map((p) => (
                      <tr key={p.id}>
                        <td>{p.user.email}</td>
                        <td>
                          {p.amount} {p.currency}
                        </td>
                        <td>{p.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Нет платежей.</p>
            )}
          </section>
          <section className="card">
            <h2>Последние подписки</h2>
            {data.subscriptions.map((s) => (
              <p key={s.id}>
                {s.user.email} · {s.plan.name} · {s.status} · до{' '}
                {new Date(s.expiresAt).toLocaleString('ru-RU')}
              </p>
            ))}
            {!data.subscriptions.length && <p>Нет подписок.</p>}
          </section>
          <section className="card">
            <h2>Синхронизация VPN</h2>
            {data.vpn.map((v) => (
              <p key={v.userId}>
                {v.userId} · {v.status} {v.lastError && '· ' + v.lastError}
              </p>
            ))}
            {!data.vpn.length && <p>Доступы пока не создавались.</p>}
          </section>
          <section className="card">
            <h2>Ошибки аудита</h2>
            {data.errors.map((e) => (
              <p key={e.id}>
                {e.action} · {new Date(e.createdAt).toLocaleString('ru-RU')}
              </p>
            ))}
            {!data.errors.length && <p>Нет записей об ошибках.</p>}
          </section>
        </>
      )}
    </Shell>
  );
}
