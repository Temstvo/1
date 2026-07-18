export const mainMenuKeyboard = [
  [
    { text: '📊 Account', callback_data: 'menu:status' },
    { text: '🔑 Subscription', callback_data: 'menu:subscription' },
  ],
  [
    { text: '🌐 Servers', callback_data: 'menu:servers' },
    { text: '📈 Traffic', callback_data: 'menu:traffic' },
  ],
  [
    { text: '📱 Devices', callback_data: 'menu:devices' },
    { text: '🚪 Logout', callback_data: 'menu:logout' },
  ],
];

export const backButton = {
  text: '◀️ Back',
  callback_data: 'menu:main',
};
