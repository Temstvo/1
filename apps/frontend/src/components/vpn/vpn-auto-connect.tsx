'use client';

import { useState } from 'react';
import { useTranslations } from '@/lib/i18n';
import api from '@/lib/api';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'restoring' | 'failed';

interface AutoConnectResult {
  node: {
    id: string;
    source: string;
    protocol: string;
    country: string;
    endpoint: string;
    score: number;
  };
  uri?: string;
  configId?: string;
  fallbacks: {
    id: string;
    source: string;
    protocol: string;
    country: string;
    endpoint: string;
    score: number;
  }[];
}

export function VpnAutoConnect() {
  const { t } = useTranslations();
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [result, setResult] = useState<AutoConnectResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [tryCount, setTryCount] = useState(0);

  const handleConnect = async () => {
    if (status === 'connecting' || status === 'restoring') return;

    setStatus('connecting');
    setTryCount(0);
    setResult(null);
    setCopied(false);

    try {
      const res = await api.get('/vpn/config/auto', { timeout: 15000 });
      setResult(res.data);
      setStatus('connected');
    } catch {
      setStatus('failed');
    }
  };

  const handleRestore = async () => {
    if (status !== 'connected' || !result) return;

    setStatus('restoring');
    const next = tryCount + 1;
    const fallback = result.fallbacks[next - 1];

    try {
      const res = await api.get(
        `/vpn/config/auto?protocol=${fallback?.protocol || ''}&exclude=${result.node.id}`,
        { timeout: 15000 },
      );
      setResult(res.data);
      setStatus('connected');
    } catch {
      setStatus('restoring');
      if (next < (result.fallbacks.length || 1)) {
        setTryCount(next);
        setTimeout(handleRestore, 1500);
      } else {
        setStatus('failed');
      }
    }
  };

  const copyUri = async () => {
    if (!result?.uri) return;
    await navigator.clipboard.writeText(result.uri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const circleClass =
    status === 'connected'
      ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl shadow-green-500/30'
      : status === 'connecting' || status === 'restoring'
        ? 'bg-gradient-to-br from-yellow-500 to-orange-500 shadow-2xl shadow-yellow-500/30'
        : status === 'failed'
          ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-2xl shadow-red-500/30'
          : 'bg-gradient-to-br from-purple-600 to-cyan-500 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105';

  const statusText =
    status === 'connected'
      ? t('vpn_auto_ready')
      : status === 'connecting'
        ? t('vpn_auto_finding')
        : status === 'restoring'
          ? t('vpn_auto_restoring')
          : status === 'failed'
            ? t('vpn_auto_failed')
            : t('vpn_auto_connect');

  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-5 py-8">
        <div className="relative">
          <div
            className={`absolute inset-0 rounded-full transition-all duration-500 ${
              status === 'connected'
                ? 'bg-green-500/20 blur-2xl scale-125'
                : status === 'connecting' || status === 'restoring'
                  ? 'bg-yellow-500/20 blur-2xl scale-125 animate-pulse'
                  : status === 'failed'
                    ? 'bg-red-500/10 blur-2xl scale-110'
                    : 'bg-purple-500/10 blur-2xl scale-110'
            }`}
          />
          <button
            onClick={handleConnect}
            disabled={status === 'connecting' || status === 'restoring'}
            className={`relative h-36 w-36 rounded-full transition-all duration-500 ${circleClass} ${status === 'failed' ? 'animate-none' : ''}`}
          >
            <div className="flex h-full flex-col items-center justify-center">
              {status === 'connected' ? (
                <>
                  <svg
                    className="mb-1 h-12 w-12 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="px-2 text-center text-white text-xs font-semibold leading-tight">
                    {statusText}
                  </span>
                </>
              ) : status === 'connecting' || status === 'restoring' ? (
                <>
                  <svg
                    className="mb-1 h-12 w-12 text-white animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="px-2 text-center text-white text-xs font-semibold leading-tight">
                    {statusText}
                  </span>
                </>
              ) : (
                <>
                  <svg
                    className="mb-1 h-12 w-12 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3"
                    />
                  </svg>
                  <span className="px-2 text-center text-white text-xs font-semibold leading-tight">
                    {statusText}
                  </span>
                </>
              )}
            </div>
          </button>
        </div>

        {result && (status === 'connected' || status === 'restoring') && (
          <div className="w-full max-w-md space-y-4">
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                {t('vpn_auto_ready')} · {result.node.country} · {result.node.protocol.toUpperCase()}
              </p>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                {t('vpn_auto_best_match')}
              </p>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] font-mono break-all">
                {result.node.endpoint}
              </p>
            </div>

            {result.uri && (
              <button
                onClick={copyUri}
                className="w-full rounded-xl bg-[hsl(var(--primary))] py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              >
                {copied ? t('vpn_copied') : t('vpn_copy_config')}
              </button>
            )}

            <button
              onClick={handleRestore}
              className="w-full rounded-xl bg-[#1e1e24] border border-[#2a2a32] py-3 text-sm font-medium text-[hsl(var(--foreground))] transition-all hover:border-[#3a3a44] active:scale-[0.98]"
            >
              {status === 'restoring' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {t('vpn_auto_restoring')}
                </span>
              ) : (
                `${t('vpn_auto_fallback')} 1`
              )}
            </button>
          </div>
        )}

        {status === 'failed' && (
          <div className="w-full max-w-md space-y-4">
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                {t('vpn_auto_failed')}
              </p>
            </div>
            <button
              onClick={handleConnect}
              className="w-full rounded-xl bg-[hsl(var(--primary))] py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            >
              {t('vpn_auto_try_again')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
