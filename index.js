require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
    try {
        const message = await anthropic.messages.create({
            model: "claude-sonnet-5",
            max_tokens: 1024,
            messages: [{ role: "user", content: "أهلاً، هل يمكنك تأكيد أنك تتلقى بياناتي الآن؟" }],
        });
        
        console.log("رد كلاود:", message.content[0].text);
    } catch (error) {
        console.error("خطأ:", error.message);
    }
}

main();
