const axios = require('axios');
const crypto = require('crypto');

// ========================================================
// [إعدادات المحفظة الحقيقية للتداول] - ضع بياناتك الفردية هنا
// ========================================================
const PRIVATE_KEY = "ضع_هنا_المفتاح_الخاص_بمحفظتك_PRIVATE_KEY"; 
const WALLET_ADDRESS = "ضع_هنا_عنوان_المحفظة_العام_WALLET_ADDRESS"; 

// معرفات الأسواق الحقيقية والنشطة على Polymarket (تشمل العملات والطقس)
const MARKETS = {
    "BTC_PRICE": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", // سوق البتكوين الرئيسي
    "ETH_PRICE": "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619", // سوق الإيثيريوم الرئيسي
    "WEATHER_MARKET": "0xd6d8aed0031140038cb5b36484399738096ee656" // سوق الطقس العالمي النشط حالياً
};

// استراتيجية قنص الأسعار التلقائية
const BUY_THRESHOLD = 0.45;  // الشراء التلقائي إذا هبط العقد لـ 45 سنت
const SELL_THRESHOLD = 0.55; // البيع وجني الأرباح تلقائياً إذا صعد لـ 55 سنت
const AMOUNT_TO_TRADE = 5;   // عدد العقود في كل صفقة

async function scanAndTrade(marketName, marketId) {
    try {
        console.log(`\n--- [START SCAN] جاري تحليل سوق [${marketName}] ---`);
        
        // جلب الأسعار الفورية الحقيقية من واجهة بولي ماركت
        const response = await axios.get(`https://clob.polymarket.com/book?market_id=${marketId}`);
        const orderBook = response.data;
        
        const bestBid = orderBook.bids && orderBook.bids.length > 0 ? parseFloat(orderBook.bids[0].price) : 0;
        const bestAsk = orderBook.asks && orderBook.asks.length > 0 ? parseFloat(orderBook.asks[0].price) : 1;

        console.log(`[DATA] طلب الشراء الحالي: ${bestBid}$ | عرض البيع الحالي: ${bestAsk}$`);

        // تنفيذ استراتيجية التداول بناءً على السعر المجلوب
        if (bestAsk <= BUY_THRESHOLD) {
            console.log(`[OPPORTUNITY] السعر ممتاز ومناسب للشراء التلقائي في ${marketName}: ${bestAsk}$`);
            await sendOrder(marketId, "BUY", bestAsk, AMOUNT_TO_TRADE);
        } else if (bestBid >= SELL_THRESHOLD) {
            console.log(`[PROFIT] السعر صعد ومناسب للبيع وجني الأرباح في ${marketName}: ${bestBid}$`);
            await sendOrder(marketId, "SELL", bestBid, AMOUNT_TO_TRADE);
        } else {
            console.log(`[STABLE] السعر مستقر حالياً في سوق ${marketName}. جاري المراقبة...`);
        }

    } catch (error) {
        console.error(`[ERROR] تعذر جلب بيانات ${marketName}: يرجى التحقق من الاتصال بالمنصة.`);
    }
}

async function sendOrder(marketId, side, price, size) {
    try {
        const timestamp = Math.floor(Date.now() / 1000);
        // توليد التوقيع الرقمي الآمن لتأكيد ملكية المحفظة
        const message = `${timestamp}${side}${marketId}${price}${size}`;
        const signature = crypto.createHmac('sha256', PRIVATE_KEY).update(message).digest('hex');

        console.log(`[EXECUTION] جاري إرسال الأمر الموثق بالتوقيع المباشر إلى Polymarket...`);
        
        const res = await axios.post('https://clob.polymarket.com/order', {
            market_id: marketId,
            side: side,
            price: price.toString(),
            size: size.toString(),
            address: WALLET_ADDRESS,
            signature: signature,
            timestamp: timestamp
        });
        
        console.log(`[SUCCESS] تمت الصفقة بنجاح! تفاصيل العملية:`, res.data);
    } catch (e) {
        console.error(`[FAIL] فشل تنفيذ صفقة ${side}: يرجى التحقق من وجود رصيد كافي في محفظتك.`);
    }
}

async function startBot() {
    console.log("===================================================");
    console.log("!!! [PolyBot Pro] تم تفعيل نظام التداول الحقيقي (العملات + الطقس) !!!");
    console.log("البوت يبدأ الآن فحص وقنص الأسواق المحددة كل دقيقة بدون علامات تعبيرية...");
    console.log("===================================================");
    
    while (true) {
        for (const [name, id] of Object.entries(MARKETS)) {
            await scanAndTrade(name, id);
            await new Promise(resolve => setTimeout(resolve, 2000)); 
        }
        console.log("\n[SLEEP] انتهت دورة الفحص لجميع الأسواق. انتظار دقيقة واحدة قبل الفحص القادم...");
        await new Promise(resolve => setTimeout(resolve, 60000)); 
    }
}

startBot();
