'use client';

import { useTranslations } from '@/lib/i18n';

export default function PrivacyPage() {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-[hsl(222,14%,6%)] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">{t('privacy_title')}</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-[hsl(222,10%,70%)]">
          <section>
            <h2 className="text-xl font-semibold text-white">{t('privacy_s1_title')}</h2>
            <p>{t('privacy_s1_text')}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white">{t('privacy_s2_title')}</h2>
            <p>{t('privacy_s2_text')}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white">{t('privacy_s3_title')}</h2>
            <p>{t('privacy_s3_text')}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white">{t('privacy_s4_title')}</h2>
            <p>{t('privacy_s4_text')}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white">{t('privacy_s5_title')}</h2>
            <p>{t('privacy_s5_text')}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white">{t('privacy_s6_title')}</h2>
            <p>{t('privacy_s6_text')}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white">{t('privacy_s7_title')}</h2>
            <p>{t('privacy_s7_text')}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
