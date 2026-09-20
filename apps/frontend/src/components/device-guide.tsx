'use client';
import { useId, useState } from 'react';
import Link from 'next/link';
import { Icon } from './icon';
const platforms = ['Windows', 'macOS', 'iOS', 'Android', 'Linux'] as const;
const tips: Record<(typeof platforms)[number], string> = {
  Windows: 'Установите клиент для Windows с поддержкой VLESS Reality.',
  macOS: 'Установите совместимый клиент для вашей версии macOS.',
  iOS: 'Установите на iPhone клиент с поддержкой VLESS Reality.',
  Android: 'Установите на Android клиент с поддержкой VLESS Reality.',
  Linux: 'Используйте совместимый клиент для вашего дистрибутива Linux.',
};
export default function DeviceGuide() {
  const [active, setActive] = useState<(typeof platforms)[number]>('Windows');
  const id = useId();
  return (
    <section className="device-section section" id="devices">
      <div className="device-copy">
        <p className="eyebrow">
          <span className="section-index">03 /</span> В ВАШЕМ РИТМЕ
        </p>
        <h2>
          Большой экран.
          <br />И тот, что <em>в кармане.</em>
        </h2>
        <p>
          Дома, в поездке, на работе. Используйте персональную конфигурацию на привычных
          устройствах.
        </p>
        <div className="device-tabs" role="tablist" aria-label="Выберите операционную систему">
          {platforms.map((p, i) => (
            <button
              key={p}
              role="tab"
              id={id + '-' + p}
              aria-selected={active === p}
              aria-controls={id + '-panel'}
              tabIndex={active === p ? 0 : -1}
              onClick={() => setActive(p)}
              onKeyDown={(e) => {
                let next = i;
                if (e.key === 'ArrowRight') next = (i + 1) % platforms.length;
                else if (e.key === 'ArrowLeft')
                  next = (i + platforms.length - 1) % platforms.length;
                else if (e.key === 'Home') next = 0;
                else if (e.key === 'End') next = platforms.length - 1;
                else return;
                e.preventDefault();
                setActive(platforms[next]);
                document.getElementById(id + '-' + platforms[next])?.focus();
              }}
            >
              {p}
            </button>
          ))}
        </div>
        <div
          id={id + '-panel'}
          role="tabpanel"
          tabIndex={0}
          aria-labelledby={id + '-' + active}
          className="device-panel"
        >
          <p>
            <Icon name="check" />
            {tips[active]}
          </p>
          <p>
            <Icon name="check" />
            После оплаты импортируйте ссылку из кабинета.
          </p>
          <p>
            <Icon name="check" />
            Включите подключение в установленном клиенте.
          </p>
        </div>
        <Link className="text-button" href="/demo">
          Открыть кабинет <Icon name="arrow" />
        </Link>
      </div>
      <div className="device-art" aria-hidden="true">
        <div className="device-glow" />
        <div className="desktop-device">
          <div className="device-toolbar">
            <i />
            <i />
            <i />
            <span>appi vpn</span>
          </div>
          <div className="device-screen">
            <span className="screen-label">ВАШЕ ЛИЧНОЕ ПРОСТРАНСТВО</span>
            <div className="screen-orbit">
              <Icon name="shield" />
            </div>
            <strong>
              Всё начинается
              <br />с подключения.
            </strong>
            <span className="screen-pill">
              VLESS Reality <Icon name="arrow" />
            </span>
          </div>
          <div className="desktop-base" />
        </div>
        <div className="phone-device">
          <div className="phone-camera" />
          <span className="phone-brand">
            appi<span>vpn</span>
          </span>
          <div className="phone-orbit">
            <Icon name="power" />
          </div>
          <strong>
            На вашей
            <br />
            стороне.
          </strong>
          <small>Персональный доступ</small>
          <div className="phone-bar" />
        </div>
        <span className="device-caption">Иллюстрация совместимых устройств</span>
      </div>
    </section>
  );
}
