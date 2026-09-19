export const mainMenuKeyboard = [
  [{ text: '🚀 Импорт в Happ', callback_data: 'menu:subscription' }],
  [{ text: '⭐ Premium', callback_data: 'menu:premium' }],
  [{ text: '🎁 Пригласи друга', callback_data: 'menu:referral' }],
  [{ text: '🔗 Моя подписка', callback_data: 'menu:mysubscription' }],
  [{ text: '👤 Профиль', callback_data: 'menu:profile' }],
  [
    { text: '📱 Инструкция', callback_data: 'menu:instructions' },
    { text: '🔧 Статус', callback_data: 'menu:status' },
  ],
  [
    { text: '❓ Помощь', callback_data: 'menu:help' },
    { text: 'ℹ️ Информация', callback_data: 'menu:info' },
  ],
  [{ text: '🌐 Сайт', url: 'https://appi-frontend.vercel.app' }],
  [{ text: '🛡 Прокси MTProto', callback_data: 'menu:mtproto' }],
  [{ text: '🛡 TG WS Proxy', url: 'https://github.com/Flowseal/tg-ws-proxy/releases' }],
];

export const backButton = {
  text: '◀️ Назад',
  callback_data: 'menu:main',
};
