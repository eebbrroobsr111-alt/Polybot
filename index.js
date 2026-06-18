
const axios = require('axios');
const crypto = require('crypto');
const { HttpsProxyAgent } = require('https-proxy-agent');

// ========================================================
// [بيانات الحساب والتداول]
// ========================================================
const PRIVATE_KEY = "7b704485d8634d6986105a05f22a704b1100df553215457d9bb12fd4f34b6958"; 
const WALLET_ADDRESS = "0x88801Fdb39B84211855bBD57Db5c4e88BF8FF393"; 

// خادم وكيل أوروبي سريع لضمان تخطي الحجب أثناء الصفقات
const proxyAgent = new HttpsProxyAgent('http://45.131.5.154:8000');

// معرفات أسواق polymarket الرسمية
const MARKETS = {
    "BTC_PRICE": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", 
    "ETH_PRICE": "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"
};

// إعدادات الإستراتيجية الرقمية
const BUY_THRESHOLD = 0.45;  // الشراء إذا قل السعر عن 45 سنت
const SELL_THRESHOLD = 0.55; // البيع إذا زاد السعر عن 55 سنت
const AMOUNT_TO_TRADE = 2;   // حجم الصفقة بالدولار الرقمي

async function scanAndTrade(marketName, marketId) {
    try {
        console.log(`\nChecking market rates for: [${marketName}]...`);
        
        // جلب الأسعار الحقيقية من المنصة مباشرة عبر البروكسي
        const response = await axios.get(`https://clob.polymarket.com/book?market_id=${marketId}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            httpsAgent: proxyAgent,
            timeout: 9000
        });
        
        const orderBook = response.data;
        const bestBid = orderBook.bids && orderBook.bids.length > 0 ? parseFloat(orderBook.bids[0].price) : 0;
        const bestAsk = orderBook.asks && orderBook.asks.length > 0 ? parseFloat(orderBook.asks[0].price) : 1;

        console.log(`>>> REAL TIME -> Bid: ${bestBid}$ | Ask: ${bestAsk}$`);

        // فحص الشروط لبدء التداول الفعلي
        if (bestAsk > 0 && bestAsk <= BUY_THRESHOLD) {
            console.log(`[ACTION] Price is cheap (${bestAsk}$). Executing BUY Order now!`);
            await executeOrder(marketId, "BUY", bestAsk, AMOUNT_TO_TRADE);
        } else if (bestBid >= SELL_THRESHOLD) {
            console.log(`[ACTION] Target profit reached (${bestBid}$). Executing SELL Order now!`);
            await executeOrder(marketId, "SELL", bestBid, AMOUNT_TO_TRADE);
        } else {
            console.log(`[HOLD] Market is stable. No trading action taken.`);
        }
    } catch (error) {
        console.error(`[NETWORK ERROR] Failed to fetch live prices from Polymarket. Retrying next cycle...`);
    }
}

async function executeOrder(marketId, side, price, size) {
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        const message = `${timestamp}${side}${marketId}${price}${size}`;
        const signature = crypto.createHmac('sha256', PRIVATE_KEY).update(message).digest('hex');

        console.log(`[TRANSACTION] Signing secure block. Sending order to blockchain...`);

        const res = await axios.post('https://clob.polymarket.com/order', {
            market_id: marketId, side: side, price: price.toString(), size: size.toString(),
            address: WALLET_ADDRESS, signature: signature, timestamp: timestamp
        }, { httpsAgent: proxyAgent });
        
        console.log(`[SUCCESS] ORDER EXECUTED SUCCESSFULLY! Block ID:`, res.data);
    } catch (e) {
        console.error(`[EXECUTION DROPPED] Could not complete order. Ensure your wallet has USDC balance.`);
    }
}

async function startBot() {
    console.clear();
    console.log("========================================= ");
    console.log("   POLYMARKET LIVE TRADING ENGINE v5.0    ");
    console.log("========================================= ");
    console.log(`🟢 STATUS: RUNNING`);
    console.log(`🟢 WALLET ATTACHED: ${WALLET_ADDRESS}`);
    console.log("========================================= \n");
    
    while (true) {
        for (const [name, id] of Object.entries(MARKETS)) {
            await scanAndTrade(name, id);
            await new Promise(resolve => setTimeout(resolve, 5000)); 
        }
        console.log("\nSleeping for 20 seconds before checking trends again...");
        await new Promise(resolve => setTimeout(resolve, 20000)); 
    }
}

startBot();
