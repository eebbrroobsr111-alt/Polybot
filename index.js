const { Anthropic } = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: "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"
});

async function main() {
  console.log("🚀 جاري الاتصال...");
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

main();
