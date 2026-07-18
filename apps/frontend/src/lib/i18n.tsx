'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type Lang = 'en' | 'ru';

const translations = {
  en: {
    // Sidebar
    sidebar_add: 'Add',
    sidebar_servers: 'Servers',
    sidebar_settings: 'Settings',
    sidebar_stats: 'Statistics',
    sidebar_logs: 'Logs',

    // VPN page
    vpn_title: 'Servers',
    vpn_search: 'Search servers...',
    vpn_ping_all: 'Ping all',
    vpn_collapse_all: 'Collapse all',
    vpn_add_url: 'Add URL',
    vpn_ping_test: 'Ping test',
    vpn_disconnected: 'Disconnected',
    vpn_connecting: 'Connecting...',
    vpn_connected: 'Connected',

    // Settings page
    settings_title: 'Settings',
    settings_interface: 'Interface',
    settings_language: 'Language',
    settings_theme: 'Theme',
    settings_theme_system: 'System',
    settings_theme_light: 'Light',
    settings_theme_dark: 'Dark',
    settings_interface_settings: 'Interface Settings',
    settings_tunnel: 'Tunnel',
    settings_routing_rules: 'Routing Rules',
    settings_app_proxy: 'App Proxy Settings',
    settings_fragmentation: 'Enable Fragmentation',
    settings_multiplexor: 'Enable Multiplexor',
    settings_ip_type: 'Preferred IP Type',
    settings_additional: 'Additional',
    settings_additional_settings: 'Additional Settings',
    settings_subscription: 'Subscription',
    settings_ping: 'Ping',
    settings_lan: 'Allow LAN Connections',
    settings_other: 'Other',
    settings_logs: 'Logs',
    settings_reset: 'Reset',
    settings_about: 'About',
    settings_faq: 'FAQ',
    settings_url_schemes: 'URL Schemes',
    settings_about_app: 'About App',

    // Downloads page
    downloads_title: 'Downloads',
    downloads_clients: 'VPN Clients',

    // Traffic / Statistics page
    stats_title: 'Statistics',
    stats_server: 'Server',
    stats_start_time: 'Start Time',
    stats_connection_time: 'Connection Time',
    stats_proxy_bandwidth: 'Proxy Bandwidth',
    stats_download: 'Download',
    stats_upload: 'Upload',
    stats_data_proxy: 'Data Usage via Proxy',
    stats_data_direct: 'Direct Data Usage',
    stats_direct_download: 'Direct Download',
    stats_direct_upload: 'Direct Upload',

    // Logs page
    logs_title: 'Logs',
    logs_hint: 'Press Ctrl+R to create a report',
    logs_main: 'Main Log',
    logs_core: 'Core Log',
    logs_tunnel: 'Tunnel Log',
    logs_antifilter: 'AntiFilter Log',
    logs_subscription: 'Subscription Log',
    logs_service: 'Service Log',

    // Subscription page
    sub_title: 'Subscription',
    sub_current_plan: 'Current Plan',
    sub_renews: 'Renews on',
    sub_traffic: 'Traffic',
    sub_devices: 'Devices',
    sub_protocols: 'Protocols',
    sub_change: 'Change Plan',
    sub_cancel: 'Cancel',
    sub_available: 'Available Plans',
    sub_popular: 'Popular',
    sub_select: 'Select',
    sub_current: 'Current',
    sub_traffic_value: '{n} traffic',
    sub_devices_value: '{n} devices',

    // Login
    login_welcome: 'Welcome back',
    login_subtitle: 'Sign in to your APPI VPN account',
    login_email: 'Email',
    login_password: 'Password',
    login_forgot: 'Forgot password?',
    login_submit: 'Sign In',
    login_loading: 'Signing in...',
    login_no_account: "Don't have an account?",
    login_create: 'Create one',
    login_error: 'Invalid email or password',

    // Register
    register_title: 'Create account',
    register_subtitle: 'Join APPI VPN for private internet access',
    register_email: 'Email',
    register_password: 'Password',
    register_confirm: 'Confirm Password',
    register_hint: 'Uppercase, lowercase, number, special character',
    register_submit: 'Create Account',
    register_loading: 'Creating account...',
    register_has_account: 'Already have an account?',
    register_signin: 'Sign in',
    register_error_match: 'Passwords do not match',
    register_error_length: 'Password must be at least 8 characters',
    register_error_fail: 'Registration failed. Try again.',

    // Forgot password
    forgot_title: 'Reset password',
    forgot_subtitle: "Enter your email and we'll send you a reset link",
    forgot_email: 'Email',
    forgot_submit: 'Send reset link',
    forgot_check: 'Check your email',
    forgot_sent: 'We sent a password reset link to',
    forgot_back: 'Back to login',
    forgot_remember: 'Remember your password?',
    forgot_login: 'Log in',

    // Checkout
    checkout_signin: 'Sign In',
    checkout_register: 'Register',
    checkout_step_plan: 'Choose a Plan',
    checkout_step_plan_sub: 'Select the plan that suits you',
    checkout_free: 'Free',
    checkout_continue: 'Continue',
    checkout_back: 'Back',
    checkout_details_title: 'Your Details',
    checkout_details_sub: 'Enter your email to receive the VPN key',
    checkout_email: 'Email',
    checkout_promo: 'Promo Code',
    checkout_promo_enter: 'Enter promo code',
    checkout_promo_apply: 'Apply',
    checkout_promo_ok: 'Promo code applied! 10% discount',
    checkout_payment_title: 'Payment',
    checkout_payment_sub: 'Choose a payment method',
    checkout_plan: 'Plan',
    checkout_price: 'Price',
    checkout_discount: 'Discount (10%)',
    checkout_total: 'Total',
    checkout_card: 'Bank Card (SBP / Visa / Mastercard)',
    checkout_card_desc: 'Instant payment via YooKassa',
    checkout_crypto: 'Cryptocurrency',
    checkout_crypto_desc: 'BTC, ETH, USDT, LTC and other',
    checkout_telegram: 'Telegram Bot',
    checkout_telegram_desc: 'Pay via @AppiVPNBot',
    checkout_pay: 'Pay',
    checkout_get_free: 'Get Free Key',
    checkout_secure: 'Secure payment. 30-day money-back guarantee.',
    checkout_success: 'Payment Successful!',
    checkout_success_sub: 'Your VPN key has been sent to',
    checkout_your_key: 'Your VPN Key',
    checkout_copy: 'Copy key',
    checkout_home: 'Home',

    // Landing page
    landing_hero_title: 'Fast and Secure',
    landing_hero_accent: 'VPN Application',
    landing_hero_desc: 'Stable servers, 24/7 uptime without limits. Set up in a minute with the modern VLESS protocol',
    landing_get_key: 'Get Key',
    landing_try_free: 'Try Free',
    landing_users: 'Active Users',
    landing_rating: 'Average Rating',
    landing_countries: 'Countries',
    landing_features_title: 'Why Choose APPI VPN?',
    landing_features_desc: 'Cutting-edge technologies for maximum performance and security',
    landing_feature1_title: 'High Speed',
    landing_feature1_desc: 'Optimized engine with VLESS protocol for maximum connection speed without quality loss',
    landing_feature2_title: 'Native Apps',
    landing_feature2_desc: 'Native apps for Windows, macOS, iOS, Android and Linux with a single intuitive interface',
    landing_feature3_title: 'Unlimited Traffic',
    landing_feature3_desc: 'No traffic or bandwidth limits for comfortable use 24/7',
    landing_feature4_title: 'VLESS Protocol',
    landing_feature4_desc: 'Modern next-gen VLESS protocol for maximum security and performance',
    landing_feature5_title: 'Servers Worldwide',
    landing_feature5_desc: 'High-speed servers in over 50 countries for stable connections',
    landing_feature6_title: 'Full Privacy',
    landing_feature6_desc: 'Strict no-logs policy and military-grade encryption protect your data',
    landing_servers_title: 'Servers Worldwide',
    landing_servers_desc: 'High-speed servers in key locations for optimal connectivity',
    landing_ping: 'Ping',
    landing_speed: 'Speed',
    landing_uptime: 'Uptime',
    landing_online: 'Online',
    landing_download_title: 'Download APPI VPN',
    landing_download_desc: 'Choose your platform and start using it right now',
    landing_download_btn: 'Download',
    landing_faq_title: 'Frequently Asked Questions',
    landing_cta_title: 'Ready to Get Started?',
    landing_cta_desc: 'Join millions of users who already chose APPI VPN for fast and secure internet',
    landing_footer_desc: 'Fast and secure proxy service',
    landing_footer_product: 'Product',
    landing_footer_features: 'Features',
    landing_footer_servers: 'Servers',
    landing_footer_downloads: 'Downloads',
    landing_footer_account: 'Account',
    landing_footer_login: 'Sign In',
    landing_footer_checkout: 'Get Key',
    landing_footer_register: 'Register',
    landing_footer_copy: '© 2026 APPI VPN. All rights reserved.',
    landing_faq_q1: 'What is the VLESS protocol and how is it better?',
    landing_faq_a1: 'VLESS is a modern next-gen protocol that provides maximum speed and security. It uses minimal resources, has low latency and high resistance to blocking.',
    landing_faq_q2: 'Are there any traffic limits?',
    landing_faq_a2: 'No, APPI VPN provides completely unlimited traffic. You can use as much data as you need without any speed or volume restrictions.',
    landing_faq_q3: 'Which devices does APPI VPN support?',
    landing_faq_a3: 'APPI VPN supports all popular platforms: Windows, macOS, iOS, Android and Linux. All apps have a native interface optimized for each platform.',
    landing_faq_q4: 'How secure is APPI VPN?',
    landing_faq_a4: 'We use cutting-edge encryption, modern security protocols and do not log your activity. Your data is fully protected and never stored on our servers.',
    landing_faq_q5: 'What is the connection speed?',
    landing_faq_a5: 'Thanks to the VLESS protocol and optimized infrastructure, APPI VPN provides speeds up to 25 Gbps on our servers. Actual speed depends on your internet connection and chosen server.',
  } as Record<string, string>,

  ru: {
    // Sidebar
    sidebar_add: 'Добавить',
    sidebar_servers: 'Серверы',
    sidebar_settings: 'Настройки',
    sidebar_stats: 'Статистика',
    sidebar_logs: 'Логи',

    // VPN page
    vpn_title: 'Серверы',
    vpn_search: 'Введите текст для поиска',
    vpn_ping_all: 'Пинг всех',
    vpn_collapse_all: 'Свернуть все',
    vpn_add_url: 'Добавить URL',
    vpn_ping_test: 'Тест пинга',
    vpn_disconnected: 'Отключён',
    vpn_connecting: 'Подключение...',
    vpn_connected: 'Подключён',

    // Settings page
    settings_title: 'Настройки',
    settings_interface: 'Интерфейс',
    settings_language: 'Язык',
    settings_theme: 'Тема',
    settings_theme_system: 'Система',
    settings_theme_light: 'Светлая',
    settings_theme_dark: 'Тёмная',
    settings_interface_settings: 'Настройки интерфейса',
    settings_tunnel: 'Туннель',
    settings_routing_rules: 'Правила маршрутизации',
    settings_app_proxy: 'Настройки прокси приложений',
    settings_fragmentation: 'Включить фрагментацию',
    settings_multiplexor: 'Включить мультиплексор',
    settings_ip_type: 'Предпочтительный тип IP',
    settings_additional: 'Дополнительно',
    settings_additional_settings: 'Дополнительные настройки',
    settings_subscription: 'Подписка',
    settings_ping: 'Пинг',
    settings_lan: 'Разрешить подключения LAN',
    settings_other: 'Прочее',
    settings_logs: 'Логи',
    settings_reset: 'Сброс',
    settings_about: 'О приложении',
    settings_faq: 'FAQ',
    settings_url_schemes: 'URL-схемы',
    settings_about_app: 'О приложении',

    // Downloads page
    downloads_title: 'Загрузки',
    downloads_clients: 'VPN-клиенты',

    // Traffic / Statistics page
    stats_title: 'Статистика',
    stats_server: 'Сервер',
    stats_start_time: 'Время начала',
    stats_connection_time: 'Время подключения',
    stats_proxy_bandwidth: 'Пропускная способность прокси',
    stats_download: 'Загрузка',
    stats_upload: 'Отправка',
    stats_data_proxy: 'Трафик через прокси',
    stats_data_direct: 'Прямой трафик',
    stats_direct_download: 'Прямая загрузка',
    stats_direct_upload: 'Прямая отправка',

    // Logs page
    logs_title: 'Логи',
    logs_hint: 'Нажмите Ctrl+R для создания отчёта',
    logs_main: 'Основной лог',
    logs_core: 'Лог ядра',
    logs_tunnel: 'Лог туннеля',
    logs_antifilter: 'Лог AntiFilter',
    logs_subscription: 'Лог подписки',
    logs_service: 'Лог сервиса',

    // Subscription page
    sub_title: 'Подписка',
    sub_current_plan: 'Текущий план',
    sub_renews: 'Обновление',
    sub_traffic: 'Трафик',
    sub_devices: 'Устройства',
    sub_protocols: 'Протоколы',
    sub_change: 'Сменить план',
    sub_cancel: 'Отмена',
    sub_available: 'Доступные планы',
    sub_popular: 'Популярный',
    sub_select: 'Выбрать',
    sub_current: 'Текущий',
    sub_traffic_value: '{n} трафик',
    sub_devices_value: '{n} устройств',

    // Login
    login_welcome: 'С возвращением',
    login_subtitle: 'Войдите в свой аккаунт APPI VPN',
    login_email: 'Электронная почта',
    login_password: 'Пароль',
    login_forgot: 'Забыли пароль?',
    login_submit: 'Войти',
    login_loading: 'Вход...',
    login_no_account: 'Нет аккаунта?',
    login_create: 'Создать',
    login_error: 'Неверный email или пароль',

    // Register
    register_title: 'Создать аккаунт',
    register_subtitle: 'Присоединяйтесь к APPI VPN для безопасного доступа в интернет',
    register_email: 'Электронная почта',
    register_password: 'Пароль',
    register_confirm: 'Подтвердите пароль',
    register_hint: 'Заглавные, строчные буквы, цифра, спецсимвол',
    register_submit: 'Создать аккаунт',
    register_loading: 'Создание...',
    register_has_account: 'Уже есть аккаунт?',
    register_signin: 'Войти',
    register_error_match: 'Пароли не совпадают',
    register_error_length: 'Пароль должен быть не менее 8 символов',
    register_error_fail: 'Ошибка регистрации. Попробуйте снова.',

    // Forgot password
    forgot_title: 'Сброс пароля',
    forgot_subtitle: 'Введите email, и мы отправим вам ссылку для сброса',
    forgot_email: 'Электронная почта',
    forgot_submit: 'Отправить ссылку',
    forgot_check: 'Проверьте почту',
    forgot_sent: 'Мы отправили ссылку для сброса пароля на',
    forgot_back: 'Назад к входу',
    forgot_remember: 'Вспомнили пароль?',
    forgot_login: 'Войти',

    // Checkout
    checkout_signin: 'Войти',
    checkout_register: 'Регистрация',
    checkout_step_plan: 'Выберите план',
    checkout_step_plan_sub: 'Выберите подходящий план',
    checkout_free: 'Бесплатно',
    checkout_continue: 'Продолжить',
    checkout_back: 'Назад',
    checkout_details_title: 'Ваши данные',
    checkout_details_sub: 'Введите email для получения VPN-ключа',
    checkout_email: 'Электронная почта',
    checkout_promo: 'Промокод',
    checkout_promo_enter: 'Введите промокод',
    checkout_promo_apply: 'Применить',
    checkout_promo_ok: 'Промокод применён! Скидка 10%',
    checkout_payment_title: 'Оплата',
    checkout_payment_sub: 'Выберите способ оплаты',
    checkout_plan: 'План',
    checkout_price: 'Цена',
    checkout_discount: 'Скидка (10%)',
    checkout_total: 'Итого',
    checkout_card: 'Банковская карта (СБП / Visa / Mastercard)',
    checkout_card_desc: 'Мгновенная оплата через ЮKassa',
    checkout_crypto: 'Криптовалюта',
    checkout_crypto_desc: 'BTC, ETH, USDT, LTC и другие',
    checkout_telegram: 'Telegram Bot',
    checkout_telegram_desc: 'Оплата через @AppiVPNBot',
    checkout_pay: 'Оплатить',
    checkout_get_free: 'Получить бесплатный ключ',
    checkout_secure: 'Безопасная оплата. Возврат в течение 30 дней.',
    checkout_success: 'Оплата прошла успешно!',
    checkout_success_sub: 'Ваш VPN-ключ отправлен на',
    checkout_your_key: 'Ваш VPN-ключ',
    checkout_copy: 'Скопировать ключ',
    checkout_home: 'На главную',

    // Landing page
    landing_hero_title: 'Быстрый и безопасный',
    landing_hero_accent: 'VPN-клиент',
    landing_hero_desc: 'Стабильные серверы, работа 24/7 без ограничений. Настройка за минуту с современным протоколом VLESS',
    landing_get_key: 'Получить ключ',
    landing_try_free: 'Попробовать бесплатно',
    landing_users: 'Активных пользователей',
    landing_rating: 'Средняя оценка',
    landing_countries: 'Стран',
    landing_features_title: 'Почему выбирают APPI VPN?',
    landing_features_desc: 'Передовые технологии для максимальной производительности и безопасности',
    landing_feature1_title: 'Высокая скорость',
    landing_feature1_desc: 'Оптимизированный движок с протоколом VLESS для максимальной скорости без потери качества',
    landing_feature2_title: 'Нативные приложения',
    landing_feature2_desc: 'Нативные приложения для Windows, macOS, iOS, Android и Linux с интуитивным интерфейсом',
    landing_feature3_title: 'Безлимитный трафик',
    landing_feature3_desc: 'Без ограничений трафика и пропускной способности для комфортного использования 24/7',
    landing_feature4_title: 'Протокол VLESS',
    landing_feature4_desc: 'Современный протокол нового поколения для максимальной безопасности и производительности',
    landing_feature5_title: 'Серверы по всему миру',
    landing_feature5_desc: 'Высокоскоростные серверы в более чем 50 странах для стабильных соединений',
    landing_feature6_title: 'Полная приватность',
    landing_feature6_desc: 'Строгая политика без логов и шифрование военного уровня защищают ваши данные',
    landing_servers_title: 'Серверы по всему миру',
    landing_servers_desc: 'Высокоскоростные серверы в ключевых локациях для оптимальной связности',
    landing_ping: 'Пинг',
    landing_speed: 'Скорость',
    landing_uptime: 'Аптайм',
    landing_online: 'Онлайн',
    landing_download_title: 'Скачать APPI VPN',
    landing_download_desc: 'Выберите платформу и начните использовать прямо сейчас',
    landing_download_btn: 'Скачать',
    landing_faq_title: 'Часто задаваемые вопросы',
    landing_cta_title: 'Готовы начать?',
    landing_cta_desc: 'Присоединяйтесь к миллионам пользователей, которые уже выбрали APPI VPN для быстрого и безопасного интернета',
    landing_footer_desc: 'Быстрый и безопасный прокси-сервис',
    landing_footer_product: 'Продукт',
    landing_footer_features: 'Возможности',
    landing_footer_servers: 'Серверы',
    landing_footer_downloads: 'Загрузки',
    landing_footer_account: 'Аккаунт',
    landing_footer_login: 'Войти',
    landing_footer_checkout: 'Получить ключ',
    landing_footer_register: 'Регистрация',
    landing_footer_copy: '© 2026 APPI VPN. Все права защищены.',
    landing_faq_q1: 'Что такое протокол VLESS и чем он лучше?',
    landing_faq_a1: 'VLESS — это современный протокол нового поколения, обеспечивающий максимальную скорость и безопасность. Он использует минимальные ресурсы, имеет низкую задержку и высокую устойчивость к блокировкам.',
    landing_faq_q2: 'Есть ли ограничения на трафик?',
    landing_faq_a2: 'Нет, APPI VPN предоставляет полностью безлимитный трафик. Вы можете использовать столько данных, сколько нужно, без каких-либо ограничений скорости или объёма.',
    landing_faq_q3: 'Какие устройства поддерживает APPI VPN?',
    landing_faq_a3: 'APPI VPN поддерживает все популярные платформы: Windows, macOS, iOS, Android и Linux. Все приложения имеют нативный интерфейс, оптимизированный для каждой платформы.',
    landing_faq_q4: 'Насколько безопасен APPI VPN?',
    landing_faq_a4: 'Мы используем передовое шифрование, современные протоколы безопасности и не ведём логи вашей активности. Ваши данные полностью защищены и никогда не хранятся на наших серверах.',
    landing_faq_q5: 'Какова скорость соединения?',
    landing_faq_a5: 'Благодаря протоколу VLESS и оптимизированной инфраструктуре APPI VPN обеспечивает скорость до 25 Гбит/с на наших серверах. Реальная скорость зависит от вашего подключения и выбранного сервера.',
  } as Record<string, string>,
};

export type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('appi-lang') as Lang | null;
    if (saved && (saved === 'en' || saved === 'ru')) setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('appi-lang', l);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[lang]?.[key] || translations.en[key] || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslations() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useTranslations must be used within LanguageProvider');
  return ctx;
}
