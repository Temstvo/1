'use client';

import { useState } from 'react';
import { useTranslations } from '@/lib/i18n';

type ModalStep = 'code' | 'details';

interface Props {
  open: boolean;
  onClose: () => void;
  onServersAdded: (servers: { id: string; country: string; city: string; code: string; protocol: string; flag: string; online: boolean }[]) => void;
}

export default function AddSubscriptionModal({ open, onClose, onServersAdded }: Props) {
  const { t } = useTranslations();
  const [step, setStep] = useState<ModalStep>('code');
  const [code, setCode] = useState('');
  const [subName, setSubName] = useState('');
  const [subUrl, setSubUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleCodeSubmit = () => {
    setError('');
    if (code.length !== 3) {
      setError(t('modal_code_error') || 'Enter a 3-character code');
      return;
    }
    setStep('details');
  };

  const handleAdd = () => {
    setError('');
    if (!subName.trim()) {
      setError(t('modal_name_error') || 'Enter subscription name');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const newServers = [
        { id: `sub-${Date.now()}-1`, country: 'Germany', city: 'Frankfurt', code: 'DE', protocol: 'VLESS', flag: '🇩🇪', online: true },
        { id: `sub-${Date.now()}-2`, country: 'Netherlands', city: 'Amsterdam', code: 'NL', protocol: 'VLESS', flag: '🇳🇱', online: true },
        { id: `sub-${Date.now()}-3`, country: 'United States', city: 'New York', code: 'US', protocol: 'VLESS', flag: '🇺🇸', online: true },
      ];
      try {
        const existing = JSON.parse(localStorage.getItem('appi-added-servers') || '[]');
        localStorage.setItem('appi-added-servers', JSON.stringify([...existing, ...newServers]));
      } catch {}
      onServersAdded(newServers);
      setLoading(false);
      handleClose();
    }, 1000);
  };

  const handleClose = () => {
    setStep('code');
    setCode('');
    setSubName('');
    setSubUrl('');
    setError('');
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-[#1a1a20] border border-[#2a2a32] rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-semibold text-white">
            {step === 'code' ? (t('modal_title') || 'Add configuration') : (t('modal_details_title') || 'Subscription details')}
          </h2>
          <button onClick={handleClose} className="text-[hsl(var(--muted-foreground))] hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-6 pt-2">
          {step === 'code' ? (
            /* Step 1: Enter code */
            <div className="space-y-4">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {t('modal_code_desc') || 'Enter the 3-character activation code from your subscription'}
              </p>
              <div>
                <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-1.5">
                  {t('modal_code_label') || 'Activation code'}
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.toUpperCase().slice(0, 3)); setError(''); }}
                  maxLength={3}
                  className="w-full px-4 py-3 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl text-white text-center text-2xl font-mono tracking-[0.5em] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))] transition-colors uppercase"
                  placeholder="___"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
              <button
                onClick={handleCodeSubmit}
                className="w-full py-3 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white font-semibold rounded-xl transition-colors"
              >
                {t('modal_next') || 'Next'}
              </button>
            </div>
          ) : (
            /* Step 2: Subscription details */
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-1.5">
                  {t('modal_type') || 'Type'}
                </label>
                <select className="w-full px-4 py-3 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl text-white text-sm focus:outline-none focus:border-[hsl(var(--primary))] transition-colors">
                  <option>{t('modal_type_subscription') || 'Subscription'}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-1.5">
                  {t('modal_name') || 'Subscription name'}
                </label>
                <input
                  type="text"
                  value={subName}
                  onChange={(e) => { setSubName(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl text-white text-sm placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))] transition-colors"
                  placeholder={t('modal_name_placeholder') || 'My VPN'}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-1.5">
                  {t('modal_url') || 'Subscription URL'}
                </label>
                <input
                  type="text"
                  value={subUrl}
                  onChange={(e) => setSubUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-xl text-white text-sm placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))] transition-colors"
                  placeholder="https://..."
                />
              </div>

              {/* Toggle options */}
              <div className="space-y-0 border border-[hsl(var(--border))] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
                  <div>
                    <div className="text-sm text-white">{t('modal_hide_settings') || 'Hide server settings'}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{t('modal_hide_settings_desc') || "You won't be able to edit server settings in this subscription"}</div>
                  </div>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{t('modal_off') || 'Off'}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
                  <div>
                    <div className="text-sm text-white">{t('modal_encrypted') || 'Encrypted subscription'}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{t('modal_encrypted_desc') || 'The link you are adding is encrypted'}</div>
                  </div>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{t('modal_off') || 'Off'}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="text-sm text-white">{t('modal_unsafe') || 'Allow unsafe connection'}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{t('modal_unsafe_desc') || 'Allow unencrypted connections'}</div>
                  </div>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{t('modal_off') || 'Off'}</span>
                </div>
              </div>

              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {t('modal_warning') || 'If you enable hidden server settings or add an encrypted subscription, you will no longer be able to edit this subscription.'}
              </p>

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep('code'); setError(''); }}
                  className="flex-1 py-3 border border-[hsl(var(--border))] rounded-xl text-sm font-medium text-[hsl(var(--muted-foreground))] hover:bg-white/5 transition-colors"
                >
                  {t('modal_back') || 'Back'}
                </button>
                <button
                  onClick={handleAdd}
                  disabled={loading}
                  className="flex-1 py-3 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
                >
                  {loading ? (t('modal_adding') || 'Adding...') : (t('modal_add') || 'Add')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
