// استدعاء الإعدادات من ملف .env
require('dotenv').config();
const { Anthropic } = require('@anthropic-ai/sdk');

// تعريف البوت مع مفتاحك الموجود في ملف .env
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

async function testConnection() {
    console.log("🚀 جاري فحص الاتصال بـ Claude...");
    try {
        // تجربة إرسال رسالة بسيطة
        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 10,
            messages: [{ role: "user", content: "Hello, are you there?" }]
        });
        
        console.log("✅ نجاح! البوت متصل. رد Claude هو:", message.content[0].text);
    } catch (error) {
        console.error("❌ حدث خطأ:", error.message);
    }
}

// تشغيل دالة الفحص
testConnection();

