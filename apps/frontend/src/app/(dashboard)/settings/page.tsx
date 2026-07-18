'use client';

import { useState } from 'react';
import { useTranslations } from '@/lib/i18n';

export default function SettingsPage() {
  const { lang, setLang, t } = useTranslations();
  const [theme, setTheme] = useState('System');
  const [fragmentation, setFragmentation] = useState(false);
  const [multiplexor, setMultiplexor] = useState(false);
  const [ipType, setIpType] = useState('IPv4');
  const [lanAccess, setLanAccess] = useState(false);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">{t('settings_title')}</h1>

      {/* Interface Settings */}
      <div>
        <h2 className="happ-section-header">{t('settings_interface')}</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="happ-settings-row">
            <span className="happ-settings-label">{t('settings_language')}</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'en' | 'ru')}
              className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="en">English</option>
              <option value="ru">Русский</option>
            </select>
          </div>
          <div className="happ-settings-row">
            <span className="happ-settings-label">{t('settings_theme')}</span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
            >
              <option>{t('settings_theme_system')}</option>
              <option>{t('settings_theme_light')}</option>
              <option>{t('settings_theme_dark')}</option>
            </select>
          </div>
          <button className="happ-settings-row w-full text-left hover:bg-[var(--muted)]/50 transition-colors">
            <span className="happ-settings-label">{t('settings_interface_settings')}</span>
            <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tunnel Settings */}
      <div>
        <h2 className="happ-section-header">{t('settings_tunnel')}</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <button className="happ-settings-row w-full text-left hover:bg-[var(--muted)]/50 transition-colors">
            <span className="happ-settings-label">{t('settings_routing_rules')}</span>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </button>
          <button className="happ-settings-row w-full text-left hover:bg-[var(--muted)]/50 transition-colors">
            <span className="happ-settings-label">{t('settings_app_proxy')}</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
              <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </button>
          <div className="happ-settings-row">
            <span className="happ-settings-label">{t('settings_fragmentation')}</span>
            <button
              onClick={() => setFragmentation(!fragmentation)}
              className={`happ-toggle h-6 w-11 ${fragmentation ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'}`}
            >
              <span className={`happ-toggle-knob ${fragmentation ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="happ-settings-row">
            <span className="happ-settings-label">{t('settings_multiplexor')}</span>
            <button
              onClick={() => setMultiplexor(!multiplexor)}
              className={`happ-toggle h-6 w-11 ${multiplexor ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'}`}
            >
              <span className={`happ-toggle-knob ${multiplexor ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="happ-settings-row">
            <span className="happ-settings-label">{t('settings_ip_type')}</span>
            <select
              value={ipType}
              onChange={(e) => setIpType(e.target.value)}
              className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
            >
              <option>IPv4</option>
              <option>IPv6</option>
            </select>
          </div>
        </div>
      </div>

      {/* Additional Settings */}
      <div>
        <h2 className="happ-section-header">{t('settings_additional')}</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <button className="happ-settings-row w-full text-left hover:bg-[var(--muted)]/50 transition-colors">
            <span className="happ-settings-label">{t('settings_additional_settings')}</span>
            <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <button className="happ-settings-row w-full text-left hover:bg-[var(--muted)]/50 transition-colors">
            <span className="happ-settings-label">{t('settings_subscription')}</span>
            <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <button className="happ-settings-row w-full text-left hover:bg-[var(--muted)]/50 transition-colors">
            <span className="happ-settings-label">{t('settings_ping')}</span>
            <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <div className="happ-settings-row">
            <span className="happ-settings-label">{t('settings_lan')}</span>
            <button
              onClick={() => setLanAccess(!lanAccess)}
              className={`happ-toggle h-6 w-11 ${lanAccess ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'}`}
            >
              <span className={`happ-toggle-knob ${lanAccess ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Others */}
      <div>
        <h2 className="happ-section-header">{t('settings_other')}</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <button className="happ-settings-row w-full text-left hover:bg-[var(--muted)]/50 transition-colors">
            <span className="happ-settings-label">{t('settings_logs')}</span>
            <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <button className="happ-settings-row w-full text-left hover:bg-[var(--muted)]/50 transition-colors">
            <span className="text-sm text-red-500">{t('settings_reset')}</span>
            <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* About */}
      <div>
        <h2 className="happ-section-header">{t('settings_about')}</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <button className="happ-settings-row w-full text-left hover:bg-[var(--muted)]/50 transition-colors">
            <span className="happ-settings-label">{t('settings_faq')}</span>
            <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <button className="happ-settings-row w-full text-left hover:bg-[var(--muted)]/50 transition-colors">
            <span className="happ-settings-label">{t('settings_url_schemes')}</span>
            <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <button className="happ-settings-row w-full text-left hover:bg-[var(--muted)]/50 transition-colors">
            <span className="happ-settings-label">{t('settings_about_app')}</span>
            <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
