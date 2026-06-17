const axios = require('axios');
const crypto = require('crypto');

// ========================================================
// [تنبيه أمان] ضع مفاتيح محفظتك الحقيقية هنا لبدء التداول الفعلي
// ========================================================
const PRIVATE_KEY = "ضع_هنا_المفتاح_الخاص_بمحفظتك_السرّي"; 
const WALLET_ADDRESS = "ضع_هنا_عنوان_المحفظة_العام"; 

// معرفات الأسواق الرسمية والنشطة على Polymarket
const MARKETS = {
    "BTC_PRICE": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", 
    "ETH_PRICE": "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619", 
    "WEATHER_MARKET": "0xd6d8aed0031140038cb5b36484399738096ee656" 
};

const BUY_THRESHOLD = 0.45;  
const SELL_THRESHOLD = 0.55; 
const AMOUNT_TO_TRADE = 5;   

async function scanAndTrade(marketName, marketId) {
    try {
        console.log(`\n--- [START] Analyzing Market: ${marketName} ---`);
        
        const response = await axios.get(`https://clob.polymarket.com/book?market_id=${marketId}`);
        const orderBook = response.data;
        
        const bestBid = orderBook.bids && orderBook.bids.length > 0 ? parseFloat(orderBook.bids[0].price) : 0;
        const bestAsk = orderBook.asks && orderBook.asks.length > 0 ? parseFloat(orderBook.asks[0].price) : 1;

        console.log(`[LIVE DATA] Bid Price: ${bestBid}$ | Ask Price: ${bestAsk}$`);

        if (bestAsk <= BUY_THRESHOLD) {
            console.log(`[OPPORTUNITY] Price is low! Buying ${marketName} at ${bestAsk}$`);
            await sendOrder(marketId, "BUY", bestAsk, AMOUNT_TO_TRADE);
        } else if (bestBid >= SELL_THRESHOLD) {
            console.log(`[PROFIT] Price is high! Selling ${marketName} at ${bestBid}$`);
            await sendOrder(marketId, "SELL", bestBid, AMOUNT_TO_TRADE);
        } else {
            console.log(`[STABLE] Price is stable for ${marketName}. Monitoring continuously...`);
        }
    } catch (error) {
        console.error(`[CONNECTION ERROR] Could not fetch data for ${marketName}. Check network.`);
    }
}

async function sendOrder(marketId, side, price, size) {
    if (PRIVATE_KEY.includes("ضع_هنا")) {
        console.error(`[SECURITY ERROR] Please insert your real PRIVATE_KEY and WALLET_ADDRESS to execute trades.`);
        return;
    }
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        const message = `${timestamp}${side}${marketId}${price}${size}`;
        const signature = crypto.createHmac('sha256', PRIVATE_KEY).update(message).digest('hex');

        console.log(`[EXECUTION] Sending secure signed order to Polymarket...`);
        
        const res = await axios.post('https://clob.polymarket.com/order', {
            market_id: marketId,
            side: side,
            price: price.toString(),
            size: size.toString(),
            address: WALLET_ADDRESS,
            signature: signature,
            timestamp: timestamp
        });
        
        console.log(`[SUCCESS] Trade executed successfully! Details:`, res.data);
    } catch (e) {
        console.error(`[FAIL] Order rejected. Check wallet balance or API permissions.`);
    }
}

async function startBot() {
    console.log("===================================================");
    console.log("!!! [PolyBot Pro] LIVE TRADING ENGINE ACTIVATED !!!");
    console.log("Monitoring: Bitcoin, Ethereum, and Weather Markets...");
    console.log("===================================================");
    
    while (true) {
        for (const [name, id] of Object.entries(MARKETS)) {
            await scanAndTrade(name, id);
            await new Promise(resolve => setTimeout(resolve, 2000)); 
        }
        console.log("\n[CYCLE COMPLETE] Waiting 60 seconds before next scan...");
        await new Promise(resolve => setTimeout(resolve, 60000)); 
    }
}

startBot();
