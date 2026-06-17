const axios = require('axios');

// ==========================================
// ⚙️ إعدادات المحفظة والبيانات السرية
// ==========================================
const PRIVATE_KEY = "ضع_هنا_المفتاح_الخاص_بمحفظتك_PRIVATE_KEY"; 
const WALLET_ADDRESS = "ضع_هنا_عنوان_المحفظة_العام_WALLET_ADDRESS"; 

// معرفات الأسواق الافتراضية للعملات والطقس على بولي ماركت
const MARKETS = {
    "BTC_PRICE": "BTC-PRICE-MARKET-ID",
    "ETH_PRICE": "ETH-PRICE-MARKET-ID",
    "XRP_PRICE": "XRP-PRICE-MARKET-ID",
    "BNB_PRICE": "BNB-PRICE-MARKET-ID",
    "WEATHER_MARKET": "WEATHER-MARKET-ID"
};

const BUY_THRESHOLD = 0.45;  
const SELL_THRESHOLD = 0.55; 

async function scanAndTrade(marketName, marketId) {
    try {
        console.log(`\n🔄 جاري فحص سوق [${marketName}] عبر واجهة Polymarket API...`);
        
        // جلب أسعار كتاب الأوامر مباشرة من خوادم بولي ماركت الرسمية
        const response = await axios.get(`https://clob.polymarket.com/book?market_id=${marketId}`);
        const orderBook = response.data;
        
        const bestBid = orderBook.bids && orderBook.bids.length > 0 ? parseFloat(orderBook.bids[0].price) : 0;
        const bestAsk = orderBook.asks && orderBook.asks.length > 0 ? parseFloat(orderBook.asks[0].price) : 1;

        console.log(`📊 [${marketName}] - أفضل طلب شراء: ${bestBid}$ | أفضل عرض بيع: ${bestAsk}$`);

        if (bestAsk <= BUY_THRESHOLD) {
            console.log(`🚀 [قنص] فرصة شراء سريعة تلقائية بسعر ${bestAsk}$`);
            // هنا يتم إرسال أمر الشراء تلقائياً
        } else if (bestBid >= SELL_THRESHOLD) {
            console.log(`💰 [جني أرباح] فرصة بيع سريعة تلقائية بسعر ${bestBid}$`);
            // هنا يتم إرسال أمر البيع تلقائياً
        } else {
            console.log(`⏸️ لا توجد فرص قنص حالياً في سوق ${marketName}.`);
        }

    } catch (error) {
        console.error(`❌ تعذر جلب بيانات ${marketName}: السعر غير متوفر حالياً أو المعرف يحتاج تحديث.`);
    }
}

async function startBot() {
    console.log("🤖 [PolyBot] تم تفعيل البوت بنجاح.. جاري بدء المراقبة المستمرة كل دقيقة...");
    while (true) {
        for (const [name, id] of Object.entries(MARKETS)) {
            await scanAndTrade(name, id);
            await new Promise(resolve => setTimeout(resolve, 2000)); 
        }
        console.log("\n💤 انتهاء الدورة الحالية. انتظار دقيقة واحدة قبل الفحص القادم...");
        await new Promise(resolve => setTimeout(resolve, 60000)); 
    }
}

startBot();
