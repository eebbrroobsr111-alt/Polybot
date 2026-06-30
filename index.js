require('dotenv').config();
const { ethers } = require('ethers');

console.log("البوت يعمل الآن يا إبراهيم!");

async function main() {
    // هنا سنضع لاحقاً كود الاتصال بالشبكة والمنصة
    console.log("جاري تهيئة الاتصال...");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
