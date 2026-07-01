require('dotenv').config();
const { ethers } = require('ethers');
const Anthropic = require('@anthropic-ai/sdk'); // تأكد من ضبط اسم المكتبة حسب ما لديك

// الإعدادات الأساسية
const rpcUrl = process.env.RPC_URL;

if (!rpcUrl) {
    console.error("خطأ: لم يتم العثور على RPC_URL في ملف .env");
    process.exit(1);
}

const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

console.log("تم تهيئة البوت بنجاح والاتصال بالشبكة...");
