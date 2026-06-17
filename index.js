const axios = require('axios');
const crypto = require('crypto');

// ========================================================
// 🔐 [إعدادات الأمان] ضع بيانات محفظتك الحقيقية هنا
// ========================================================
const PRIVATE_KEY = "7b704485d8634d6986105a05f22a704b1100df553215457d9bb12fd4f34b6958"; 
const WALLET_ADDRESS = "0x88801Fdb39B84211855bBD57dB5c4e88BF8FF393"; 

// معرفات الأسواق الرسمية النشطة
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
        console.log(`\n[>] SCANNING -> Requesting data for market: [${marketName}]`);
        
        const response = await axios.get(`https://clob.polymarket.com/book?market_id=${marketId}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 5000
        });
        
        const orderBook = response.data;
        const bestBid = orderBook.bids && orderBook.bids.length > 0 ? parseFloat(orderBook.bids[0].price) : 0;
        const bestAsk = orderBook.asks && orderBook.asks.length > 0 ? parseFloat(orderBook.asks[0].price) : 1;

        console.log(`[+] LIVE DATA -> Bid: ${bestBid}$ | Ask: ${bestAsk}$`);

        if (bestAsk <= BUY_THRESHOLD) {
            console.log(`[!] SIGNAL -> Target price hit! Initiating BUY order at ${bestAsk}$`);
            await sendOrder(marketId, "BUY", bestAsk, AMOUNT_TO_TRADE);
        } else if (bestBid >= SELL_THRESHOLD) {
            console.log(`[!] SIGNAL -> Target profit hit! Initiating SELL order at ${bestBid}$`);
            await sendOrder(marketId, "SELL", bestBid, AMOUNT_TO_TRADE);
        } else {
            console.log(`[*] STATUS -> Stable conditions. Holding position...`);
        }
    } catch (error) {
        if (error.response) {
            console.error(`[-] API ERROR -> Server rejected handshake. Status Code: ${error.response.status}`);
        } else {
            console.error(`[-] ACCESS DENIED -> Connection block detected. Verify Wallet Signatures or VPN.`);
        }
    }
}

async function sendOrder(marketId, side, price, size) {
    if (PRIVATE_KEY.includes("ضع_هنا")) return;
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        const message = `${timestamp}${side}${marketId}${price}${size}`;
        const signature = crypto.createHmac('sha256', PRIVATE_KEY).update(message).digest('hex');

        const res = await axios.post('https://clob.polymarket.com/order', {
            market_id: marketId, side: side, price: price.toString(), size: size.toString(),
            address: WALLET_ADDRESS, signature: signature, timestamp: timestamp
        });
        console.log(`[SUCCESS] Execution block confirmed!`, res.data);
    } catch (e) {
        console.error(`[FAILURE] Order execution dropped.`);
    }
}

async function startBot() {
    // طباعة مجسم صورة البوت الاحترافي بالشارات الجوهرية للعمل
    console.clear();
    console.log("=========================================================================");
    console.log("      _____       _       ____        _      _____                 ");
    console.log("     |  __ \\     | |     |  _ \\      | |    |  __ \\                ");
    console.log("     | |__) |___ | |_   _| |_) | ___ | |_   | |__) | __ ___        ");
    console.log("     |  ___// _ \\| | | | |  _ < / _ \\| __|  |  ___/ '__/ _ \\       ");
    console.log("     | |   | (_) | | |_| | |_) | (_) | |_   | |   | | | (_) |      ");
    console.log("     |_|    \\___/|_|\\__, |____/ \\___/ \\__|  |_|   |_|  \\___/       ");
    console.log("                     __/ |                                         ");
    console.log("                    |___/                                          ");
    console.log("=========================================================================");
    console.log("[CORE] STATUS: ACTIVE | MODULE: LIVE_TRADING_ENGINE_v2.0");
    console.log(`[CORE] NET ATTACHED: POLYMARKET_CLOB | ADDRESS: ${WALLET_ADDRESS}`);
    console.log("=========================================================================");
    
    while (true) {
        for (const [name, id] of Object.entries(MARKETS)) {
            await scanAndTrade(name, id);
            await new Promise(resolve => setTimeout(resolve, 3000)); 
        }
        console.log("\n[SYSTEM] Interval complete. Entering cooldown for 30 seconds...");
        await new Promise(resolve => setTimeout(resolve, 30000)); 
    }
}

startBot();
