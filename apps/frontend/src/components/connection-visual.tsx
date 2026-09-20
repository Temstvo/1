import { BrandMark, Icon } from './icon';
/** A decorative connection diagram, never the visitor's VPN status. */
export default function ConnectionVisual() {
  return (
    <div
      className="connection-visual"
      role="img"
      aria-label="Иллюстрация: ваше устройство подключается к интернету через персональный VPN"
    >
      <div className="visual-grid" />
      <div className="visual-halo" />
      <div className="globe-object">
        <svg viewBox="0 0 400 400" fill="none" aria-hidden="true">
          <defs>
            <radialGradient id="sphere" cx=".32" cy=".24" r=".8">
              <stop stopColor="#e0ffc0" />
              <stop offset=".33" stopColor="#a8da82" />
              <stop offset=".72" stopColor="#3d7550" />
              <stop offset="1" stopColor="#152d22" />
            </radialGradient>
            <radialGradient id="globe-light">
              <stop stopColor="#f1ffdc" stopOpacity=".6" />
              <stop offset="1" stopColor="#d4fbbb" stopOpacity="0" />
            </radialGradient>
            <clipPath id="globe-clip">
              <circle cx="200" cy="200" r="168" />
            </clipPath>
          </defs>
          <circle cx="200" cy="200" r="168" fill="url(#sphere)" />
          <g clipPath="url(#globe-clip)" stroke="#193e2a" strokeOpacity=".26" strokeWidth="1">
            <ellipse cx="200" cy="200" rx="125" ry="168" />
            <ellipse cx="200" cy="200" rx="66" ry="168" />
            <path d="M200 32v336M32 200h336" />
            {[90, 140, 260, 310].map((y) => (
              <ellipse key={y} cx="200" cy={y} rx="170" ry="29" />
            ))}
          </g>
          <ellipse cx="154" cy="127" rx="118" ry="87" fill="url(#globe-light)" />
          <circle cx="200" cy="200" r="168" stroke="#d1f5a4" strokeOpacity=".45" />
          <circle cx="116" cy="138" r="5" fill="#efffde" />
          <circle cx="282" cy="223" r="5" fill="#efffde" />
          <path
            d="M116 138Q250 86 282 223"
            stroke="#f3ffda"
            strokeWidth="2"
            strokeDasharray="3 6"
          />
        </svg>
      </div>
      <div className="visual-orbit orbit-a" />
      <div className="visual-orbit orbit-b" />
      <div className="protocol-tag">
        <span className="protocol-icon">
          <Icon name="shield" />
        </span>
        <div>
          <small>Персональный протокол</small>
          <strong>VLESS Reality</strong>
        </div>
        <span className="tag-check">
          <Icon name="check" />
        </span>
      </div>
      <div className="visual-brand">
        <BrandMark />
      </div>
      <div className="connection-card">
        <div className="connection-card-heading">
          <span className="live-dot" /> ВАШ МАРШРУТ В ИНТЕРНЕТ <span>01 — 03</span>
        </div>
        <div className="connection-route">
          <div>
            <span>
              <Icon name="device" />
            </span>
            <small>Устройство</small>
          </div>
          <i />
          <div className="route-appi">
            <span>
              <BrandMark />
            </span>
            <small>Appi VPN</small>
          </div>
          <i />
          <div>
            <span>
              <Icon name="globe" />
            </span>
            <small>Интернет</small>
          </div>
        </div>
        <div className="connection-card-caption">
          <Icon name="lock" /> Персональная конфигурация. Ваш доступ.
        </div>
      </div>
      <span className="visual-caption">СХЕМА ПОДКЛЮЧЕНИЯ</span>
    </div>
  );
}
