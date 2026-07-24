export const authKeyboard = [
  [
    { text: '🔑 Sign In', callback_data: 'auth:login' },
    { text: '📝 Create Account', callback_data: 'auth:register' },
  ],
];

export const mainMenuKeyboard = [
  [
    { text: '🌐 Free VPN Configs', callback_data: 'menu:vpnconfigs' },
  ],
  [
    { text: '📊 Account', callback_data: 'menu:status' },
    { text: '🔑 Subscription', callback_data: 'menu:subscription' },
  ],
  [
    { text: '📈 Traffic', callback_data: 'menu:traffic' },
    { text: '📱 Devices', callback_data: 'menu:devices' },
  ],
  [
    { text: '🚀 Get Paid VPN', url: 'https://appi-frontend.vercel.app/checkout' },
  ],
  [
    { text: '🚪 Logout', callback_data: 'menu:logout' },
  ],
];

export const backButton = {
  text: '◀️ Back',
  callback_data: 'menu:main',
};
