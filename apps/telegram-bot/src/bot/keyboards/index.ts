export const mainMenuKeyboard = [
  [
    { text: '🔑 My Subscription', callback_data: 'menu:subscription' },
    { text: '🖥️ Servers', callback_data: 'menu:servers' },
  ],
  [
    { text: '📱 Devices', callback_data: 'menu:devices' },
    { text: '📊 Traffic', callback_data: 'menu:traffic' },
  ],
  [
    { text: '💳 Payments', callback_data: 'menu:payments' },
    { text: '🎁 Referral', callback_data: 'menu:referral' },
  ],
  [
    { text: '⚡ Quick Connect', callback_data: 'menu:quick_connect' },
    { text: '💬 Support', callback_data: 'menu:support' },
  ],
  [
    { text: '⚙️ Settings', callback_data: 'menu:settings' },
  ],
];

export const backButton = {
  text: '◀️ Back',
  callback_data: 'menu:main',
};

export const cancelButton = {
  text: '❌ Cancel',
  callback_data: 'menu:main',
};

export const confirmButton = (action: string) => [
  [
    { text: '✅ Confirm', callback_data: `confirm:${action}` },
    { text: '❌ Cancel', callback_data: 'menu:main' },
  ],
];

export const protocolKeyboard = [
  [
    { text: 'WireGuard', callback_data: 'protocol:WIREGUARD' },
    { text: 'OpenVPN', callback_data: 'protocol:OPENVPN' },
  ],
  [
    { text: 'Xray Reality', callback_data: 'protocol:XRAY_REALITY' },
    { text: 'VLESS', callback_data: 'protocol:VLESS' },
  ],
];

export const serverKeyboard = (servers: Array<{ id: string; name: string; country: string; load: number }>) => {
  const buttons: any[][] = [];
  for (const server of servers) {
    buttons.push([
      {
        text: `${server.name}, ${server.country} (${server.load}% load)`,
        callback_data: `server:${server.id}`,
      },
    ]);
  }
  buttons.push([backButton]);
  return buttons;
};

export const paymentKeyboard = [
  [{ text: '💳 Credit Card', callback_data: 'pay:card' }],
  [{ text: '₿ Cryptocurrency', callback_data: 'pay:crypto' }],
  [{ text: '📱 Telegram Payment', callback_data: 'pay:telegram' }],
  [cancelButton],
];

export const settingsKeyboard = [
  [{ text: '🌐 Language', callback_data: 'settings:language' }],
  [{ text: '🔔 Notifications', callback_data: 'settings:notifications' }],
  [{ text: '🔒 Two-Factor Auth', callback_data: 'settings:2fa' }],
  [backButton],
];
