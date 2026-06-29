const { Anthropic } = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: "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",
});

async function testConnection() {
  console.log("🚀 جاري فحص الاتصال...");
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 10,
      messages: [{ role: "user", content: "Hello" }]
    });
    console.log("✅ نجاح! البوت متصل ومفتاحك يعمل بنظام.");
  } catch (error) {
    console.error("❌ حدث خطأ:", error.message);
  }
}

testConnection();
