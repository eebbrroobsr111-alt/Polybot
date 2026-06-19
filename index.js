const { ethers } = require('ethers');

// [1] الإعدادات
const PRIVATE_KEY = "7b704485d8634d6986105a05f22a704b1100df553215457d9bb12fd4f34b6958";
// تم تحديث الرابط لرابط عام ومستقر
const PROVIDER_URL = 'https://polygon-mainnet.g.alchemy.com/v2/demo';

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
                // 6 هي الخانة العشرية لعملة USDC على Polygon
                const price = parseFloat(ethers.formatUnits(priceRaw, 6)); 
                
                console.log(`[📊] السعر الحالي: ${price}`);

                if (balance < ethers.parseEther("0.01")) {
                    console.log(`[⚠️] تنبيه: الرصيد منخفض، اشحن MATIC لتفعيل التداول.`);
                }
            } catch (err) {
                console.log(`[⌛] خطأ في جلب السعر، جاري إعادة المحاولة...`);
            }
            // انتظار 15 ثانية
            await new Promise(r => setTimeout(r, 15000));
        }
    } catch (err) {
        console.error("[❌] خطأ فادح في الاتصال:", err.message);
    }
}

startEngine();
