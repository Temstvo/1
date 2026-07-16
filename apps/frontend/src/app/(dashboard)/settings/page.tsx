'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [language, setLanguage] = useState('Russian');
  const [theme, setTheme] = useState('System');
  const [fragmentation, setFragmentation] = useState(false);
  const [multiplexor, setMultiplexor] = useState(false);
  const [ipType, setIpType] = useState('IPv4');
  const [lanAccess, setLanAccess] = useState(false);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>

      {/* Interface Settings */}
      <div>
        <h2 className="happ-section-header">Interface Settings</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="happ-settings-row">
            <span className="happ-settings-label">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
            >
              <option>Russian</option>
              <option>English</option>
              <option>German</option>
              <option>French</option>
              <option>Spanish</option>
            </select>
          </div>
          <div className="happ-settings-row">
            <span className="happ-settings-label">Theme</span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
            >
              <option>System</option>
              <option>Light</option>
              <option>Dark</option>
            </select>
          </div>
          <button className="happ-settings-row w-full text-left hover:bg-[var(--muted)]/50 transition-colors">
            <span className="happ-settings-label">Interface Settings</span>
            <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tunnel Settings */}
      <div>
        <h2 className="happ-section-header">Tunnel Settings</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <button className="happ-settings-row w-full text-left hover:bg-[var(--muted)]/50 transition-colors">
            <span className="happ-settings-label">Routing Rules</span>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </button>
          <button className="happ-settings-row w-full text-left hover:bg-[var(--muted)]/50 transition-colors">
            <span className="happ-settings-label">App Proxy Settings</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
              <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </button>
          <div className="happ-settings-row">
            <span className="happ-settings-label">Enable Fragmentation</span>
            <button
              onClick={() => setFragmentation(!fragmentation)}
              className={`happ-toggle ${fragmentation ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'}`}
            >
              <span className={`happ-toggle-knob ${fragmentation ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="happ-settings-row">
            <span className="happ-settings-label">Enable Multiplexor</span>
            <button
              onClick={() => setMultiplexor(!multiplexor)}
              className={`happ-toggle ${multiplexor ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'}`}
            >
              <span className={`happ-toggle-knob ${multiplexor ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="happ-settings-row">
            <span className="happ-settings-label">Preferred IP Type</span>
            <select
              value={ipType}
              onChange={(e) => setIpType(e.target.value)}
              className="bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
            >
              <option>IPv4</option>
              <option>IPv6</option>
            </select>
          </div>
        </div>
      </div>

      {/* Additional Settings */}
      <div>
        <h2 className="happ-section-header">Additional Settings</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <button className="happ-settings-row w-full text-left hover:bg-[var(--muted)]/50 transition-colors">
            <span className="happ-settings-label">Additional Settings</span>
            <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <button className="happ-settings-row w-full text-left hover:bg-[var(--muted)]/50 transition-colors">
            <span className="happ-settings-label">Subscription</span>
            <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <button className="happ-settings-row w-full text-left hover:bg-[var(--muted)]/50 transition-colors">
            <span className="happ-settings-label">Ping</span>
            <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <div className="happ-settings-row">
            <span className="happ-settings-label">Allow LAN Connections</span>
            <button
              onClick={() => setLanAccess(!lanAccess)}
              className={`happ-toggle ${lanAccess ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'}`}
            >
              <span className={`happ-toggle-knob ${lanAccess ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Others */}
      <div>
        <h2 className="happ-section-header">Other</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <button className="happ-settings-row w-full text-left hover:bg-[var(--muted)]/50 transition-colors">
            <span className="happ-settings-label">Logs</span>
            <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <button className="happ-settings-row w-full text-left hover:bg-[var(--muted)]/50 transition-colors">
            <span className="text-sm text-red-500">Reset</span>
            <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* About */}
      <div>
        <h2 className="happ-section-header">About</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <button className="happ-settings-row w-full text-left hover:bg-[var(--muted)]/50 transition-colors">
            <span className="happ-settings-label">FAQ</span>
            <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <button className="happ-settings-row w-full text-left hover:bg-[var(--muted)]/50 transition-colors">
            <span className="happ-settings-label">URL Schemes</span>
            <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <button className="happ-settings-row w-full text-left hover:bg-[var(--muted)]/50 transition-colors">
            <span className="happ-settings-label">About App</span>
            <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
