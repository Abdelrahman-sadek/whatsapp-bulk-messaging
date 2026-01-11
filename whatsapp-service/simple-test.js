const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('Starting WhatsApp client test...');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: false, // Show browser for debugging
    args: ['--no-sandbox']
  }
});

client.on('qr', (qr) => {
  console.log('QR Code received, scan with WhatsApp:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp client is ready!');
  process.exit(0);
});

client.on('authenticated', () => {
  console.log('WhatsApp client authenticated');
});

client.on('auth_failure', (msg) => {
  console.error('Authentication failed:', msg);
  process.exit(1);
});

client.initialize().catch(console.error);