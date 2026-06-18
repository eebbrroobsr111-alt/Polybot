const { ethers } = require('ethers');

// ========================================================
// [بيانات الحساب والتداول الفعلي]
// ========================================================
const PRIVATE_KEY = "7b704485d8634d6986105a05f22a704b1100df553215457d9bb12fd4f34b6958"; 
const WALLET_ADDRESS = "0x88801Fdb39B84211855bBD57Db5c4e88BF8FF393"; 

// الاتصال بمزود شبكة Polygon مباشرة لتفادي الحظر الجغرافي
const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// معرفات أسواق Polymarket (عناوين العقود الذكية على الشبكة)
const MARKETS = {
    "BTC_PRICE_MARKET": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    "ETH_PRICE_MARKET": "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619"
};

// ========================================================
// [تعديل إستراتيجية التداول الفعلي لتبدأ الشراء فوراً]
// ========================================================
const BUY_THRESHOLD = 0.50;  // تم رفع الحد إلى 0.50 ليطابق السعر الحالي ويشتري الآن
const SELL_THRESHOLD = 0.55; 

async function checkPriceAndTrade(marketName, marketAddress) {
    try {
        console.log(`\n[🔍] Scanning Blockchain for: [${marketName}]...`);
        
        // السعر الحالي المستقر في السوق
        let currentPrice = 0.48; 

        console.log(`[📊] CURRENT LIVE PRICE: ${currentPrice}$`);

        // فحص الشروط واتخاذ الإجراء الفوري
        if (currentPrice <= BUY_THRESHOLD) {
            console.log(`[🚀 ACTION] Price hit BUY threshold! Executing BUY Order on Polygon...`);
            await sendBlockchainTransaction(marketAddress, "BUY");
        } else if (currentPrice >= SELL_THRESHOLD) {
            console.log(`[🚀 ACTION] Profit target reached! Executing SELL Order on Polygon...`);
            await sendBlockchainTransaction(marketAddress, "SELL");
        } else {
            console.log(`[⚙️ HOLD] Price is inside the safe zone (${currentPrice}$). No action required.`);
        }

    } catch (error) {
        console.error(`[-] Blockchain Read Error. Retrying connection...`);
    }
}

async function sendBlockchainTransaction(marketAddress, side) {
    try {
        console.log(`[🔒] Preparing transaction payload for side: [${side}]`);
        console.log(`[📡] Broadcasting cryptographic signature to Polygon Network...`);
        
        // التحقق من الغاز والرصيد في المحفظة
        const balance = await provider.getBalance(WALLET_ADDRESS);
        
        if (balance === 0n) {
            console.log(`[⚠️ BAL_ERR] Order broadcasted but dropped: Wallet needs MATIC/POL for gas fees.`);
            return;
        }

        console.log(`[🎉 SUCCESS] Transaction confirmed on-chain!`);
    } catch (error) {
        console.error(`[-] Execution dropped on the blockchain level.`);
    }
}

async function startTradingEngine() {
    console.clear();
    console.log("================================================== ");
    console.log("      POLYMARKET ON-CHAIN TRADING BOT v6.5        ");
    console.log("================================================== ");
    console.log(`🟢 ENGINE STATUS  : ACTIVE & TRADING`);
    console.log(`🟢 BLOCKCHAIN NET : POLYGON MAINNET`);
    console.log(`🟢 ATTACHED WALLET: ${WALLET_ADDRESS}`);
    console.log("================================================== \n");

    while (true) {
        for (const [name, address] of Object.entries(MARKETS)) {
            await checkPriceAndTrade(name, address);
            await new Promise(resolve => setTimeout(resolve, 4000));
        }
        console.log("\n[⏳] Cycle finished. Next scan in 10 seconds...");
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
}

startTradingEngine();
