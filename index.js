// استيراد المكتبات اللازمة للاتصال بـ Polymarket وشبكة Polygon
const { ClobClient } = require("@polymarket/clob-sdk");
const { Wallet } = require("ethers");
require("dotenv").config();

// ==========================================
// ⚙️ إعدادات المحفظة والبيانات السرية (تعديل لمرة واحدة)
// ==========================================
// ضع المفتاح الخاص بمحفظتك هنا (تأكد أنها محفظة تجريبية بها رصيد بسيط لحمايتك)
const PRIVATE_KEY = "ضع_هنا_المفتاح_الخاص_بمحفظتك_PRIVATE_KEY"; 
// ضع عنوان المحفظة العام هنا
const WALLET_ADDRESS = "ضع_هنا_عنوان_المحفظة_العام_WALLET_ADDRESS"; 

// إعداد الاتصال بالمحفظة وشبكة البوت
const wallet = new Wallet(PRIVATE_KEY);
const client = new ClobClient({
    host: "https://clob.polymarket.com",
    secret: PRIVATE_KEY,
    address: WALLET_ADDRESS,
    chainId: 137 // شبكة Polygon المعتمدة لدى Polymarket
});

// ==========================================
// 📊 معرفات الأسواق الحقيقية (Condition IDs) على Polymarket
// ==========================================
const MARKETS = {
    "BTC_PRICE": "0x_معرف_سوق_البتكوين_الحالي",
    "ETH_PRICE": "0x_معرف_سوق_الإيثيريوم_الحالي",
    "XRP_PRICE": "0x_معرف_سوق_الـ_XRP_الحالي",
    "BNB_PRICE": "0x_معرف_سوق_الـ_BNB_الحالي",
    "WEATHER_MARKET": "0x_معرف_سوق_الطقس_الحالي"
};

// إعدادات استراتيجية التداول السريع (Scalping)
const BUY_THRESHOLD = 0.45;  // الشراء التلقائي إذا انخفض السعر عن 45 سنت
const SELL_THRESHOLD = 0.55; // البيع وجني الأرباح التلقائي إذا وصل السعر لـ 55 سنت
const TRADE_AMOUNT = 10;     // كمية العقود في كل صفقة سريعة

// ==========================================
// 🔍 خوارزمية الفحص والقنص التلقائي
// ==========================================
async function scanAndTrade(marketName, marketId) {
    try {
        console.log(`\n🔄 جاري فحص سوق [${marketName}] الآن...`);
        
        // جلب كتاب الأوامر الحالي للسوق لمعرفة أفضل الأسعار
        const orderBook = await client.getOrderBook(marketId);
        
        const bestBid = orderBook.bids.length > 0 ? parseFloat(orderBook.bids[0].price) : 0;
        const bestAsk = orderBook.asks.length > 0 ? parseFloat(orderBook.asks[0].price) : 1;

        console.log(`📊 [${marketName}] - أفضل طلب شراء: ${bestBid}$ | أفضل عرض بيع: ${bestAsk}$`);

        // 1. خوارزمية الشراء التلقائي السريع عند اقتناص فرصة هبوط
        if (bestAsk <= BUY_THRESHOLD) {
            console.log(`🚀 قنص فرصة شراء سريعة في ${marketName} بسعر ${bestAsk}$`);
            await executeOrder(marketId, "BUY", bestAsk, TRADE_AMOUNT);
        } 
        // 2. خوارزمية البيع وجني الأرباح التلقائي عند الصعود
        else if (bestBid >= SELL_THRESHOLD) {
            console.log(`💰 قنص فرصة بيع وجني أرباح سريعة في
