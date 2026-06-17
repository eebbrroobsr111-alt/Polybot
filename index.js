import os
import time
from dotenv import load_dotenv
from py_clob_client.client import ClobClient
from py_clob_client.clob_types import OrderArgs
from py_clob_client.constants import POLYGON

# 1. إعداد الاتصال والبيانات السرية
load_dotenv()
PRIVATE_KEY = os.getenv("POLYMARKET_PRIVATE_KEY")
ADDRESS = os.getenv("WALLET_ADDRESS")

# تعريف معرفات الأسواق (Condition IDs) للعملات والطقس على Polymarket
MARKETS = {
    "BTC_5MIN": "0x_market_id_for_btc_up_down",
    "ETH_5MIN": "0x_market_id_for_eth_up_down",
    "XRP_5MIN": "0x_market_id_for_xrp_up_down",
    "BNB_5MIN": "0x_market_id_for_bnb_up_down",
    "WEATHER_NYC": "0x_market_id_for_weather_markets"
}

def initialize_client():
    # ربط البوت بشبكة Polygon وحسابك الخاص
    client = ClobClient(
        host="https://clob.polymarket.com",
        private_key=PRIVATE_KEY,
        address=ADDRESS,
        chain_id=POLYGON
    )
    return client

# 2. خوارزمية فحص الفرص وقنص الأسعار (التحديث كل ثانية/دقيقة)
def scan_and_trade(client, market_name, market_id):
    try:
        # جلب كتاب الأوامر الحالي (Order Book) لمعرفة سعر العرض والطلب (Yes/No)
        order_book = client.get_order_book(market_id)
        best_bid_yes = float(order_book.bids[0].price) if order_book.bids else 0
        best_ask_yes = float(order_book.asks[0].price) if order_book.asks else 1

        print(f"[{market_name}] أفضل سعر شراء: {best_bid_yes}$ | أفضل سعر بيع: {best_ask_yes}$")

        # --- استراتيجية القنص السريع (Scalping / Arbitrage) ---
        # مثال: إذا انخفض سعر عقد (Yes) فجأة تحت القيمة العادلة بسبب بيع عشوائي، نقوم بالشراء فوراً
        BUY_THRESHOLD = 0.45  # سعر دخول مستهدف كمثال
        SELL_THRESHOLD = 0.55 # سعر خروج مستهدف بربح سريع

        if best_ask_yes <= BUY_THRESHOLD:
            print(f"🚀 قنص فرصة شراء في {market_name} بسعر {best_ask_yes}")
            execute_order(client, market_id, side="BUY", price=best_ask_yes, size=100)
            
        elif best_bid_yes >= SELL_THRESHOLD:
            print(f"💰 فرصة خروج وجني أرباح في {market_name} بسعر {best_bid_yes}")
            execute_order(client, market_id, side="SELL", price=best_bid_yes, size=100)

    except Exception as e:
        print(f"خطأ أثناء فحص سوق {market_name}: {e}")

# 3. محرك تنفيذ الصفقات التلقائي السريع
def execute_order(client, market_id, side, price, size):
    order_args = OrderArgs(
        price=price,
        size=size,
        side=side,
        token_id="...", # معرف عقد YES أو NO المحدد
        market_id=market_id
    )
    # إرسال الأمر مباشرة لمحرك مطابقة الأوامر (CLOB)
    signed_order = client.create_order(order_args)
    resp = client.post_order(signed_order)
    print(f"حالة الصفقة: {resp}")
    return resp

# 4. الحلقة اللانهائية للتشغيل المتواصل دون توقف
def main_loop():
    client = initialize_client()
    print("🤖 البوت يعمل الآن ويراقب الأسواق كل ثانية...")
    
    while True:
        for market_name, market_id in MARKETS.items():
            scan_and_trade(client, market_name, market_id)
            time.sleep(1) # الفحص السريع والبحث عن فرص كل ثانية بين الأسواق
        
        time.sleep(60) # تكرار الدورة الكاملة كل دقيقة للأسواق قصيرة المدى

if __name__ == "__main__":
    main_loop()
