require('dotenv').config();
const { ethers } = require('ethers');
const Anthropic = require('@anthropic-ai/sdk');

// الإعدادات الأساسية
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function startBot() {
    console.log("--- Trading Bot Initialized ---");

    try {
        // 1. جلب الرصيد
        const balance = await provider.getBalance(wallet.address);
        console.log("💰 Current Wallet Balance:", ethers.formatEther(balance), "ETH/MATIC");

        // 2. تحليل السوق بواسطة كلاود
        console.log("🔍 Analyzing market data...");
        const response = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 100,
            messages: [{ 
                role: "user", 
                content: "You are a professional trading bot. Bitcoin price is 65,000$. Analyze the market and answer with one word only: 'BUY' or 'WAIT'." 
            }],
        });

        const decision = response.content[0].text.trim();
        console.log("🤖 Bot Decision:", decision);

        // 3. اتخاذ القرار
        if (decision === "BUY") {
            console.log("✅ Buy signal received. Preparing transaction...");
            // ملاحظة: هذا الجزء يحتاج إعدادات إضافية لعقد التداول الذكي الخاص بك
        } else {
            console.log("⏳ Market not suitable, waiting...");
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

startBot();
