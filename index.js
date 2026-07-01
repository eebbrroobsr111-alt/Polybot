require('dotenv').config();
const { ethers } = require('ethers');
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function tradingBot() {
    console.log("Analyzing market data...");
    
    try {
        const response = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929",
            max_tokens: 100,
            messages: [{ 
                role: "user", 
                content: "You are a professional trading bot. Bitcoin price is 65,000$. Analyze the market and answer with one word only: 'BUY' or 'WAIT'." 
            }],
        });

        const decision = response.content[0].text.trim();
        console.log("Bot Decision:", decision); // الآن ستظهر النتيجة بالإنجليزية وبشكل مفهوم

        if (decision === "BUY") {
            console.log("Executing BUY order...");
        } else {
            console.log("Market not suitable, waiting...");
        }

    } catch (error) {
        console.error("Error:", error.message);
    }
}

tradingBot();
