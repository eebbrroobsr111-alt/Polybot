const { ethers } = require('ethers');
const fs = require('fs');

// [1] إعدادات المحفظة والشبكة
const PRIVATE_KEY = "7b704485d8634d6986105a05f22a704b1100df553215457d9bb12fd4f34b6958";
const PROVIDER_URL = 'https://polygon.llamarpc.com';

const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// [2] واجهة العقد (ABI)
const MARKET_ABI = [
    "function getPrice() view returns (uint256)",
    "function buy(uint256 amount) external payable",
    "function sell(uint256 amount) external"
];

// [3] الأسواق
const MARKETS = {
    "BTC": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
};

// [4] دالة حفظ سجلات الصفقات
function saveTrade(data) {
    const history = fs.existsSync('trade_history.json') ? JSON.parse(fs.readFileSync('trade_history.json', 'utf8')) : [];
    history.push({ ...data, timestamp: new Date().toLocaleString() });
    fs.writeFileSync('trade_history.json', JSON.stringify(history, null, 2));
}

// [5] دالة جلب السعر الحقيقي
async function getRealPrice(address) {
    try {
        const contract = new ethers.Contract(address, MARKET_ABI, provider);
        const price = await contract.getPrice();
        return parseFloat(ethers.formatUnits(price, 18));
    } catch (e) {
        console.error("[-] تعذر جلب السعر من البلوكشين.");
        return null;
    }
}

// [6] دالة تنفيذ الصفقة
async function executeRealTrade(address, side, price) {
    try {
        const contract = new ethers.Contract(address, MARKET_ABI, wallet);
        console.log(`[📡] محاولة تنفيذ أمر ${side} على الشبكة...`);
        
        const feeData = await provider.getFeeData();
        const gasLimit = await contract.estimateGas[side.toLowerCase()](100);

        const tx = await contract[side.toLowerCase()](100, {
            gasLimit: gasLimit,
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
            value: side === 'BUY' ? ethers.parseEther("0.001") : 0
        });

        console.log(`[✅] تم إرسال المعاملة بنجاح: ${tx.hash}`);
        await tx.wait();
        
        saveTrade({ market: address, side, price, status: "SUCCESS", tx: tx.hash });
        console.log(`[🎉] تم تنفيذ الصفقة وتأكيدها!`);
    } catch (e) {
        console.error(`[❌] فشل تنفيذ الصفقة: ${e.message}`);
    }
}

// [7] المحرك الرئيسي
async function startEngine() {
    console.log("=== بدء محرك التداول (Active) ===");
    while (true) {
        for (const [name, address] of Object.entries(MARKETS)) {
            const price = await getRealPrice(address);
            if (price === null) continue;

            console.log(`[📊] السعر المباشر لـ ${name}: ${price}`);

            if (price <= 0.50) {
                await executeRealTrade(address, "BUY", price);
            }
        }
        await new Promise(r => setTimeout(r, 10000));
    }
}

startEngine();
