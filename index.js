const { ethers } = require('ethers');
const fs = require('fs');

// [1] الإعدادات
const PRIVATE_KEY = "7b704485d8634d6986105a05f22a704b1100df553215457d9bb12fd4f34b6958";
// رابط مستقر للاتصال بشبكة Polygon
const PROVIDER_URL = 'https://polygon.llamarpc.com'; 

const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// [2] واجهة العقد (ABI)
const MARKET_ABI = [
    "function getPrice() view returns (uint256)",
    "function buy(uint256 amount) external payable",
    "function sell(uint256 amount) external"
];

// عنوان العقد الذكي
const MARKET_ADDRESS = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";

// [3] المحرك الرئيسي
async function startEngine() {
    console.log("=== بدء محرك التداول (Active) ===");
    
    try {
        const network = await provider.getNetwork();
        console.log(`[📡] متصل بشبكة: ${network.name}`);
    } catch (e) {
        console.error("[❌] فشل الاتصال، تأكد من الإنترنت.");
        return;
    }

    while (true) {
        try {
            const contract = new ethers.Contract(MARKET_ADDRESS, MARKET_ABI, provider);
            const price = parseFloat(ethers.formatUnits(await contract.getPrice(), 18));
            console.log(`[📊] السعر الحالي: ${price}`);

            if (price <= 0.50) {
                console.log(`[💡] السعر مناسب، تنفيذ صفقة شراء...`);
                // هنا يتم تنفيذ عملية الشراء
            }
        } catch (err) {
            console.error(`[⚠️] خطأ أثناء المراقبة: ${err.message}`);
        }
        await new Promise(r => setTimeout(r, 10000));
    }
}

startEngine();
