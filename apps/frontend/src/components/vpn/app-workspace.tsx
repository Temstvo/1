'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import api, { apiErrorMessage } from '@/lib/api';
import { Icon } from '@/components/icon';
import catalog from '@/data/imported-servers.json';
type Profile = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  protocol: string;
  transports: string[];
  security: string[];
  nodeCount: number;
  format: string;
};
export default function AppWorkspace() {
  const [profiles, setProfiles] = useState<Profile[]>(catalog),
    [selected, setSelected] = useState<string>(catalog[0]?.id || ''),
    [query, setQuery] = useState(''),
    [region, setRegion] = useState('all'),
    [transport, setTransport] = useState('all'),
    [loading, setLoading] = useState(true),
    [enabled, setEnabled] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/vpn/imported/servers');
      setProfiles(data.profiles);
      setEnabled(data.downloadEnabled);
      setSelected((current) =>
        data.profiles.some((p: Profile) => p.id === current) ? current : data.profiles[0]?.id || '',
      );
    } catch (e) {
      setEnabled(false);
      setError(apiErrorMessage(e, 'Не удалось обновить каталог. Показана сохранённая версия.'));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  const countries = useMemo(
    () =>
      Array.from(new Set(profiles.map((p) => p.country))).sort((a, b) => a.localeCompare(b, 'ru')),
    [profiles],
  );
  const transports = useMemo(
    () => Array.from(new Set(profiles.flatMap((p) => p.transports))).sort(),
    [profiles],
  );
  const visible = profiles.filter(
    (p) =>
      (region === 'all' || p.country === region) &&
      (transport === 'all' || p.transports.includes(transport)) &&
      [p.name, p.country, p.countryCode, ...p.transports]
        .join(' ')
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const active = profiles.find((p) => p.id === selected);
  async function exportProfile(copy = false) {
    if (!active || busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      try {
        await api.get('/users/me');
      } catch (e: any) {
        if (e.response?.status !== 401) throw e;
        await api.post('/auth/guest', {});
      }
      const { data } = await api.get('/vpn/imported/servers/' + active.id + '/config');
      const json = JSON.stringify(data.config, null, 2);
      if (copy) {
        await navigator.clipboard.writeText(json);
        setMessage('JSON скопирован. Импортируйте его в VPN-клиент.');
      } else {
        const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setMessage('Конфигурация скачана. Импортируйте JSON и включите подключение в VPN-клиенте.');
      }
    } catch (e) {
      setError(
        apiErrorMessage(
          e,
          'Не удалось экспортировать профиль. Попробуйте скачать файл вместо копирования.',
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="app-heading">
        <div>
          <p className="eyebrow">
            <span className="live-dot" /> APPI · ВАШЕ ПРОСТРАНСТВО
          </p>
          <h1>На вашей стороне.</h1>
          <p>Один профиль. Следующий шаг — подключение.</p>
        </div>
        <Link href="/dashboard" className="button secondary">
          Мой кабинет <Icon name="arrow" />
        </Link>
      </div>
      <div className="app-layout">
        <aside className="app-sidebar" aria-label="Разделы приложения">
          <a className="active" href="#server-catalog">
            <Icon name="globe" />
            <span>Серверы</span>
            <small>{profiles.length}</small>
          </a>
          <Link href="/dashboard">
            <Icon name="shield" />
            <span>Мой доступ</span>
          </Link>
          <Link href="/dashboard#plans">
            <Icon name="spark" />
            <span>Подписка</span>
          </Link>
          <Link href="/dashboard#payments">
            <Icon name="lock" />
            <span>Платежи</span>
          </Link>
          <div className="app-sidebar-note">
            <Icon name="device" />
            <strong>На любом экране</strong>
            <p>Импортируйте профиль в совместимый VPN-клиент.</p>
            <Link href="/#devices">
              Как подключиться <Icon name="arrow" />
            </Link>
          </div>
        </aside>
        <section className="app-content">
          <div className="app-overview">
            <div>
              <small>В КАТАЛОГЕ</small>
              <strong>
                {profiles.length}
                <span>профилей</span>
              </strong>
            </div>
            <div>
              <small>ГЕОГРАФИЯ</small>
              <strong>
                {countries.filter((c) => c !== 'Регион не указан').length}
                <span>регионов</span>
              </strong>
            </div>
            <div>
              <small>ПРОТОКОЛ</small>
              <strong className="protocol-heading">
                VLESS<span>TLS / Reality</span>
              </strong>
            </div>
          </div>
          <div className="app-status-line">
            <span>
              <Icon name="lock" /> Импортированные профили
            </span>
            <span>Доступность сети не проверена</span>
          </div>
          {error && (
            <div className="notice error" role="alert">
              {error}
              <button className="text-button" disabled={loading || busy} onClick={refresh}>
                Повторить
              </button>
            </div>
          )}
          {message && (
            <p className="notice" role="status">
              {message}
            </p>
          )}
          <section id="server-catalog" className="server-catalog">
            <div className="catalog-heading">
              <div>
                <p className="eyebrow">ВЫБЕРИТЕ СВОЙ МАРШРУТ</p>
                <h2>Куда подключимся?</h2>
              </div>
              <button className="text-button" disabled={loading || busy} onClick={refresh}>
                {loading ? 'Обновляем…' : 'Обновить'} <Icon name="globe" />
              </button>
            </div>
            <div className="server-filters">
              <label className="search-field">
                <Icon name="globe" />
                <input
                  aria-label="Поиск серверов"
                  placeholder="Страна, профиль или протокол"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button aria-label="Очистить поиск" onClick={() => setQuery('')}>
                    ×
                  </button>
                )}
              </label>
              <label>
                <span className="sr-only">Регион</span>
                <select value={region} onChange={(e) => setRegion(e.target.value)}>
                  <option value="all">Все регионы</option>
                  {countries.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sr-only">Транспорт</span>
                <select value={transport} onChange={(e) => setTransport(e.target.value)}>
                  <option value="all">Все протоколы</option>
                  {transports.map((t) => (
                    <option key={t} value={t}>
                      {t.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="server-results-heading">
              <span>
                {visible.length} из {profiles.length} профилей
              </span>
              <span>Нажмите, чтобы выбрать</span>
            </div>
            <div className="server-rows" aria-label="Профили серверов" aria-busy={loading}>
              {visible.map((p) => (
                <button
                  key={p.id}
                  className={'server-row ' + (selected === p.id ? 'selected' : '')}
                  aria-pressed={selected === p.id}
                  onClick={() => {
                    setSelected(p.id);
                    setMessage('');
                  }}
                >
                  <span className={'region-badge region-' + (p.countryCode || 'XX')}>
                    {p.countryCode || '—'}
                  </span>
                  <span className="server-description">
                    <strong>{p.name.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '').trim()}</strong>
                    <small>
                      {p.country} {p.nodeCount > 1 && '· ' + p.nodeCount + ' узлов'}
                    </small>
                  </span>
                  <span className="server-tags">
                    {p.transports.map((t) => (
                      <span key={t}>{t.toUpperCase()}</span>
                    ))}
                  </span>
                  <span className="server-select-indicator">
                    {selected === p.id ? <Icon name="check" /> : <Icon name="arrow" />}
                  </span>
                </button>
              ))}
            </div>
            {!visible.length && (
              <div className="servers-empty">
                <Icon name="globe" />
                <h3>{profiles.length ? 'Ничего не нашли.' : 'Каталог пока пуст.'}</h3>
                <p>
                  {profiles.length
                    ? 'Попробуйте другую страну или сбросьте фильтры.'
                    : 'Добавьте конфигурации в serv-configs на сервере приложения.'}
                </p>
                {profiles.length > 0 && (
                  <button
                    className="button secondary"
                    onClick={() => {
                      setQuery('');
                      setRegion('all');
                      setTransport('all');
                    }}
                  >
                    Сбросить фильтры
                  </button>
                )}
              </div>
            )}
          </section>
        </section>
        <aside className="connection-panel" aria-label="Выбранный профиль">
          <div className="connection-panel-top">
            <span>ВАШЕ ПОДКЛЮЧЕНИЕ</span>
            <Icon name="shield" />
          </div>
          <div className="app-power-orbit" aria-hidden="true">
            <span>
              <Icon name="power" />
            </span>
          </div>
          <span className="connection-label">{active ? 'Профиль выбран' : 'Выберите профиль'}</span>
          <h2>{active?.country || 'Ваш маршрут'}</h2>
          <p className="chosen-profile">{active?.name || 'Сначала выберите сервер в каталоге.'}</p>
          <dl className="connection-spec">
            <div>
              <dt>Защита</dt>
              <dd>
                {active?.security.map((s) => (s === 'reality' ? 'Reality' : 'TLS')).join(' / ') ||
                  '—'}
              </dd>
            </div>
            <div>
              <dt>Транспорт</dt>
              <dd>{active?.transports.join(' / ').toUpperCase() || '—'}</dd>
            </div>
            <div>
              <dt>Конфигурация</dt>
              <dd>Xray JSON</dd>
            </div>
            <div>
              <dt>Подключение</dt>
              <dd className="muted-status">В отдельном клиенте</dd>
            </div>
          </dl>
          <button
            className="button wide"
            disabled={!active || !enabled || loading || busy}
            onClick={() => exportProfile(false)}
          >
            {busy ? 'Готовим профиль…' : 'Скачать конфигурацию'}
            <Icon name="arrow" />
          </button>
          <button
            className="text-button copy-profile"
            disabled={!active || !enabled || loading || busy}
            onClick={() => exportProfile(true)}
          >
            <Icon name="copy" /> Скопировать JSON
          </button>
          {!loading && !enabled && (
            <p className="export-disabled">Экспорт пока не включён оператором сервиса.</p>
          )}
          <div className="app-setup">
            <h3>И вы на связи.</h3>
            <ol>
              <li>
                <span>1</span>Скачайте конфигурацию.
              </li>
              <li>
                <span>2</span>Импортируйте JSON в Xray-совместимый клиент.
              </li>
              <li>
                <span>3</span>Включите VPN в приложении клиента.
              </li>
            </ol>
            <p>
              Сайт не включает VPN на устройстве. Работу и срок доступа этих серверов определяет их
              владелец.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
