require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
    // 1. قراءة البيانات من ملف .env
    const privateKey = process.env.PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL;

    // 2. إعداد الاتصال بالشبكة
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // 3. إنشاء المحفظة
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("تم الاتصال بنجاح!");
    console.log("عنوان المحفظة الخاص بالبوت هو:", wallet.address);
}

main().catch((error) => {
    console.error("حدث خطأ أثناء الاتصال:", error);
});
