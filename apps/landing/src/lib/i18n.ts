export type Locale = 'en' | 'ru';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    'nav.login': 'Login',
    'nav.getStarted': 'Get Started',
    'hero.title': 'VPN that works.\nNo limits.',
    'hero.subtitle': 'VLESS Reality, Trojan, Shadowsocks. Bypass any block. Your privacy matters.',
    'hero.cta': 'Start Free Trial',
    'hero.plans': 'Plans',
    'pricing.monthly': '/mo',
    'pricing.getStarted': 'Get Started',
    'pricing.popular': 'Most Popular',
  },
  ru: {
    'nav.login': 'Войти',
    'nav.getStarted': 'Начать',
    'hero.title': 'VPN, который работает.\nБез ограничений.',
    'hero.subtitle': 'VLESS Reality, Trojan, Shadowsocks. Обходите любые блокировки. Ваша приватность важна.',
    'hero.cta': 'Попробовать бесплатно',
    'hero.plans': 'Тарифы',
    'pricing.monthly': '/мес',
    'pricing.getStarted': 'Начать',
    'pricing.popular': 'Популярный',
  },
};

export function t(locale: Locale, key: string): string {
  return translations[locale]?.[key] || translations.en[key] || key;
}
