require('dotenv').config();
const { ethers } = require('ethers');
const Anthropic = require('@anthropic-ai/sdk');

// الإعدادات والاتصال بالشبكة
const rpcUrl = process.env.RPC_URL;
if (!rpcUrl) {
    console.error("خطأ: لم يتم العثور على RPC_URL في ملف .env");
    process.exit(1);
}

// قمنا بضبط الإعدادات لزيادة وقت الانتظار (timeout) لحل مشكلة الاتصال البطيء
const provider = new ethers.JsonRpcProvider(rpcUrl, {
    chainId: 137,
    name: 'polygon'
}, {
    staticNetwork: true,
    timeout: 60000 // السماح بـ 60 ثانية للاتصال قبل إعطاء خطأ
});

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

console.log("--- تم تهيئة البوت بنجاح والاتصال بالشبكة ---");

// وظيفة جلب وعرض الرصيد
async function checkBalance() {
    try {
        console.log("جاري جلب رصيد المحفظة...");
        const balance = await provider.getBalance(wallet.address);
        console.log("عنوان المحفظة:", wallet.address);
        console.log("الرصيد الحالي:", ethers.formatEther(balance), "POL");
    } catch (error) {
        console.error("خطأ أثناء جلب الرصيد:", error);
    }
}

// تشغيل الوظيفة
checkBalance();

