require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');

// تعريف البوت فوراً في البداية
const tgBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

console.log("تم تعريف البوت بنجاح!");

// بقية كود البوت سيعمل هنا بشكل طبيعي
