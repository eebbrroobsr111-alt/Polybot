import requests
import anthropic
import time

# ضع مفتاحك هنا
API_KEY = "019ee34c-b321-72c0-8d21-72c27860670c"

client = anthropic.Anthropic(api_key=API_KEY)

def get_btc_markets():
    url = "https://gamma-api.polymarket.com/markets?tag=bitcoin&limit=5&active=true"
    r = requests.get(url)
    return r.json()

def analyze_market(market):
    # التأكد من وجود البيانات لتجنب الخطأ
    outcomes = market.get('outcomePrices', [])
    yes_price = outcomes[0] if len(outcomes) > 0 else "N/A"
    no_price = outcomes[1] if len(outcomes) > 1 else "N/A"
    
    prompt = f"""
    سوق بولي ماركت:
    السؤال: {market.get('question')}
    سعر "نعم": {yes_price}
    سعر "لا": {no_price}
    هل تنصح بالشراء؟ أجب بـ YES أو NO فقط.
    """
    
    # تأكد من استخدام اسم موديل متاح في حسابك، مثل: claude-3-5-sonnet-20241022
    msg = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=10,
        messages=[{"role": "user", "content": prompt}]
    )
    return msg.content[0].text.strip()

print("🤖 البوت يعمل...")
markets = get_btc_markets()
print(f"✅ وجدت {len(markets)} سوق")

for m in markets[:3]:
    print(f"\n📊 {m.get('question')}")
    decision = analyze_market(m)
    print(f"🧠 Claude قرر: {decision}")
    time.sleep(1)

print("\n✅ انتهى!")

