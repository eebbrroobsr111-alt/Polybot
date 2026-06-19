const { ethers } = require('ethers');

const PRIVATE_KEY = "7b704485d8634d6986105a05f22a704b1100df553215457d9bb12fd4f34b6958";
// استخدام رابط عام ومفتوح ومستقر
const PROVIDER_URL = 'https://polygon.llamarpc.com'; 

console.log("=== جاري تهيئة البوت... ===");

const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const MARKET_ADDRESS = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";
const MARKET_ABI = ["function getPrice() view returns (uint256)"];

async function startEngine() {
    try {
        console.log("=== تم الاتصال بالشبكة بنجاح ===");
        
        const balance = await provider.getBalance(wallet.address);
        console.log(`[💰] الرصيد الحالي: ${ethers.formatEther(balance)} MATIC`);

        const contract = new ethers.Contract(MARKET_ADDRESS, MARKET_ABI, provider);

        while (true) {
            try {
                const priceRaw = await contract.getPrice();
                const price = parseFloat(ethers.formatUnits(priceRaw, 6)); 
                
                console.log(`[📊] السعر الحالي: ${price}`);
            } catch (err) {
                console.log(`[⌛] انتظار للاتصال بالشبكة...`);
            }
            // زيادة وقت الانتظار إلى 30 ثانية لتجنب الحظر (429 Too Many Requests)
            await new Promise(r => setTimeout(r, 30000));
        }
    } catch (err) {
        console.error("[❌] خطأ:", err.message);
    }
}

startEngine();
