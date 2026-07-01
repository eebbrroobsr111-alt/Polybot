require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
    try {
        console.log("جاري البحث عن النماذج المتاحة...");
        const models = await anthropic.models.list();
        // طباعة أسماء النماذج المتاحة فقط
        console.log("النماذج المتاحة لحسابك هي:");
        models.data.forEach(model => console.log(model.id));
    } catch (error) {
        console.error("خطأ:", error.message);
    }
}

main();
