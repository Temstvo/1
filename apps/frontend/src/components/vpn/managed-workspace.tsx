'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import api, { apiErrorMessage } from '@/lib/api';
export default function ManagedWorkspace() {
  const [status, setStatus] = useState(''),
    [config, setConfig] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    api
      .get('/vpn/status')
      .then((r) => setStatus(r.data.status))
      .catch(() => setStatus(''));
  }, []);
  async function configuration() {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.get('/vpn/configs');
      setConfig(data.subscriptionUrl || data.links.join('\n'));
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="workspace" style={{ gridColumn: '1 / -1', width: '100%' }}>
      <p className="eyebrow">APPI · ПЕРСОНАЛЬНЫЙ VPN</p>
      <h1>
        Одно подключение.
        <br />
        Ваш доступ.
      </h1>
      <p>Управляйте подпиской и подключайте устройство через персональную ссылку.</p>
      <div className="dashboard-grid">
        <section className="card">
          <h2>Мой VPN</h2>
          <p>
            {status === 'ACTIVE'
              ? 'Доступ настроен. Получите ссылку и импортируйте её в клиент.'
              : 'Откройте кабинет, чтобы проверить подписку или начать пробный период.'}
          </p>
          <div className="actions">
            <Link className="button" href="/dashboard">
              Личный кабинет
            </Link>
            {status === 'ACTIVE' && (
              <button className="button secondary" disabled={busy} onClick={configuration}>
                Получить конфигурацию
              </button>
            )}
          </div>
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
          {config && (
            <>
              <label>
                Персональная ссылка
                <textarea readOnly value={config} onFocus={(e) => e.target.select()} />
              </label>
              <p className="fine">
                Скопируйте и импортируйте в клиент. Не передавайте ссылку другим людям.
              </p>
            </>
          )}
        </section>
        <section className="card">
          <h2>Первое подключение?</h2>
          <p>Пошаговая настройка для телефона и компьютера, помощь с оплатой и подключением.</p>
          <div className="actions">
            <Link className="button secondary" href="/guide">
              Инструкция
            </Link>
            <Link className="text-button" href="/support">
              Поддержка ↗
            </Link>
          </div>
          <p>
            <Link href="/demo">Открыть гостевой кабинет без регистрации</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
