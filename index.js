import requests
import anthropic
import time

"API_KEY = "sk-ant-api03-PHrG19nLXUo-Nil-kzZ5wCkc99DuMxjhU_3o75_IWL5xH1kyWQRnD1hP0tS-NoH46Z1264ritLUcl4qD0EAkpA-mVMISgAA

client = anthropic.Anthropic(api_key=API_KEY)

def get_btc_markets():
    url = "https://gamma-api.polymarket.com/markets?tag=bitcoin&limit=5&active=true"
    r = requests.get(url)
    return r.json()

def analyze_market(market):
    outcomes = market.get('outcomePrices', [])
    yes_price = outcomes[0] if len(outcomes) > 0 else "N/A"
    no_price = outcomes[1] if len(outcomes) > 1 else "N/A"
    prompt = f"السوق: {market.get('question')}\nنعم: {yes_price}\nلا: {no_price}\nهل تنصح بالشراء؟ YES او NO فقط."
    msg = client.messages.create(
        model="claude-opus-4-6",
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
