const { ethers } = require('ethers');

// [1] الإعدادات - ضع مفتاحك الخاص هنا
const PRIVATE_KEY = "7b704485d8634d6986105a05f22a704b1100df553215457d9bb12fd4f34b6958";
// استخدام رابط بديل وموثوق لتفادي خطأ الاتصال
const PROVIDER_URL = 'https://polygon.llamarpc.com';


console.log("=== جاري تهيئة البوت... ===");

const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const MARKET_ADDRESS = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
const MARKET_ABI = ["function getPrice() view returns (uint256)"];

async function startEngine() {
    try {
        console.log("=== تم الاتصال بالشبكة بنجاح ===");
        
        // التحقق من الرصيد
        const balance = await provider.getBalance(wallet.address);
        console.log(`[💰] الرصيد الحالي: ${ethers.formatEther(balance)} MATIC`);

        const contract = new ethers.Contract(MARKET_ADDRESS, MARKET_ABI, provider);

        while (true) {
            try {
                const priceRaw = await contract.getPrice();
                const price = parseFloat(ethers.formatUnits(priceRaw, 6)); // تم التعديل لـ 6 لأن USDC يستخدم 6 decimals
                
                console.log(`[📊] السعر الحالي: ${price}`);

                if (balance < ethers.parseEther("0.01")) {
                    console.log(`[⚠️] تنبيه: الرصيد منخفض، اشحن MATIC لتفعيل التداول.`);
                }
            } catch (err) {
                console.log(`[⌛] خطأ في جلب السعر، جاري المحاولة مجدداً...`);
            }
            // انتظار 15 ثانية قبل الفحص التالي
            await new Promise(r => setTimeout(r, 15000));
        }
    } catch (err) {
        console.error("[❌] حدث خطأ فادح في الاتصال:", err.message);
    }
}

startEngine();
