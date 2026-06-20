import os
import requests
import anthropic
from dotenv import load_dotenv
import time

load_dotenv()

ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY")
POLY_API_KEY = os.getenv("POLYMARKET_API_KEY")
POLY_ADDRESS = os.getenv("POLYMARKET_ADDRESS")

client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

def get_btc_markets():
    url = "https://gamma-api.polymarket.com/markets?tag=bitcoin&limit=5&active=true"
    r = requests.get(url)
    return r.json()

def analyze_market(market):
    prompt = f"""
    سوق بولي ماركت:
    السؤال: {market.get('question')}
    نعم: {market.get('outcomePrices', ['?'])[0]}
    لا: {market.get('outcomePrices', ['?', '?'])[1]}
    
    هل تنصح بالشراء؟ أجب بـ YES أو NO فقط.
    """
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
