'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function CheckoutSuccessPage() {
  const [link, setLink] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function generateLink() {
      try {
        const servers = await api.get('/servers', { timeout: 8000 });
        const list = Array.isArray(servers.data) ? servers.data : servers.data?.servers || [];
        const server = list.find((s: any) => s.status === 'ONLINE' || s.status === 'online') || list[0];
        if (!server) throw new Error('no servers');

        const res = await api.post(
          '/vpn/config/generate',
          { serverId: server.id, protocol: 'VLESS' },
          { timeout: 15000 },
        );

        let uri = '';
        if (typeof res.data?.config === 'string') uri = res.data.config;
        else if (typeof res.data?.uri === 'string') uri = res.data.uri;

        if (!cancelled) {
          if (uri) {
            setLink(uri);
            setStatus('ready');
          } else {
            setStatus('error');
          }
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    generateLink();
    return () => { cancelled = true; };
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Оплата прошла!</h1>
          <p className="text-gray-400 text-sm">Ваш тариф активирован. Подключение займёт минуту.</p>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Ваша ссылка для подключения</h2>
            {status === 'loading' && (
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          {status === 'ready' && (
            <>
              <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 mb-3">
                <p className="text-xs text-green-400 font-mono break-all leading-relaxed max-h-32 overflow-y-auto">{link}</p>
              </div>
              <button
                onClick={copyLink}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 rounded-full text-sm font-semibold text-white transition-all active:scale-[0.97] flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    Скопировано!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
                    Скопировать ссылку
                  </>
                )}
              </button>
            </>
          )}

          {status === 'error' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400 mb-3">
              Не удалось создать ссылку — сервер подключения временно недоступен. Зайдите в кабинет и попробуйте ещё раз.
            </div>
          )}
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-white mb-3">Как подключиться</h2>
          <ol className="text-xs text-gray-400 space-y-1.5 list-decimal list-inside">
            <li>Скопируйте ссылку кнопкой выше</li>
            <li>Установите клиент: v2rayN (Windows), v2rayNG (Android), V2Box (iOS/macOS)</li>
            <li>В клиенте выберите «Импорт из буфера» / «Add from Clipboard»</li>
            <li>Нажмите «Подключить» — сервер выберется автоматически</li>
          </ol>
        </div>

        <div className="flex gap-3 justify-center">
          <Link href="/downloads" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-semibold transition-colors">
            Скачать приложение
          </Link>
          <Link href="/dashboard" className="px-6 py-3 border border-white/10 rounded-xl text-sm font-semibold text-gray-400 hover:bg-white/5 transition-colors">
            Кабинет
          </Link>
        </div>
      </div>
    </div>
  );
}
