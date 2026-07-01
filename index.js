require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
    try {
        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            messages: [{ role: "user", content: "hello" }],
        });
        console.log("نجح الاتصال! رد كلاود:", message.content[0].text);
    } catch (error) {
        console.log("تفاصيل الخطأ:", error.error ? error.error.message : error.message);
    }
}

main();
