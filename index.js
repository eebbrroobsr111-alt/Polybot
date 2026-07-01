require('dotenv').config();
const { ethers } = require('ethers');
const Anthropic = require('@anthropic-ai/sdk');

// تهيئة كلاود
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
    console.log("البوت يتصل الآن بكلاود...");

    // هنا نحدد النموذج (Model)
    const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: "أهلاً كلاود، أنا إبراهيم. هل أنت جاهز لتحليل بيانات البلوكشين؟" }],
    });

    console.log("رد كلاود:");
    console.log(message.content[0].text);
}

main().catch(console.error);
