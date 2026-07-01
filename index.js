require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
    try {
        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 1024,
            messages: [{ role: "user", content: "أنا إبراهيم، هل يمكنك مساعدتي في تحليل بيانات التداول؟" }],
        });
        
        console.log("رد كلاود:", message.content[0].text);
    } catch (error) {
        console.error("خطأ:", error.message);
    }
}

main();
