const { ethers } = require('ethers');

// [1] الإعدادات
const PRIVATE_KEY = "7b704485d8634d6986105a05f22a704b1100df553215457d9bb12fd4f34b6958";
const PROVIDER_URL = 'https://polygon.llamarpc.com'; 

const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const MARKET_ADDRESS = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
const MARKET_ABI = ["function getPrice() view returns (uint256)"];

async function startEngine() {
    console.log("=== البوت في وضع الاستعداد (Ready-Mode) ===");
    
    // التحقق من الرصيد أولاً
    const balance = await provider.getBalance(wallet.address);
    console.log(`[💰] الرصيد الحالي: ${ethers.formatEther(balance)} MATIC`);

    while (true) {
        try {
            const contract = new ethers.Contract(MARKET_ADDRESS, MARKET_ABI, provider);
            const price = parseFloat(ethers.formatUnits(await contract.getPrice(), 18));
            
            console.log(`[📊] السعر الحالي: ${price}`);

            if (balance < ethers.parseEther("0.01")) {
                console.log(`[⚠️] تنبيه: الرصيد منخفض جداً. اشحن MATIC لتفعيل الشراء التلقائي.`);
            } else if (price <= 0.50) {
                console.log(`[✅] السعر ممتاز! الرصيد موجود، سيتم التنفيذ فوراً...`);
            }
        } catch (err) {
            console.log(`[⌛] انتظار تحديث الشبكة...`);
        }
        await new Promise(r => setTimeout(r, 15000));
    }
}

startEngine();
