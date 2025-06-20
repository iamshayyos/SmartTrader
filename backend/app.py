import os, json, re, requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from telegram_fetcher import fetch_telegram_messages
from twitter_fetcher  import fetch_twitter_tweets

load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY")

app = Flask(__name__)
CORS(app)

@app.route("/news/telegram")
def telegram_news():
    channels = [c.strip() for c in request.args.get("channels","").split(",") if c.strip()]
    all_messages = []
    for ch in channels:
        try:
            all_messages.extend(fetch_telegram_messages(ch))
        except Exception as e:
            app.logger.error(f"Telegram fetch error for '{ch}': {e}")
    return jsonify(all_messages)


@app.route("/news/twitter")
def twitter_news():
    users = [u.strip() for u in request.args.get("usernames","").split(",") if u.strip()]
    all_tweets = []
    for u in users:
        try:
            all_tweets.extend(fetch_twitter_tweets(u))
        except Exception as e:
            app.logger.error(f"Twitter fetch error for '{u}': {e}")
    return jsonify(all_tweets)


@app.route("/action_or_free", methods=["POST"])
def action_or_free():
    data  = request.get_json() or {}
    asset = data.get("asset","")
    news  = data.get("news", [])

    # בונים פרומפט
    prompt = f"""אתה יועץ השקעות מקצועי.
בתוך החדשות על {asset}:
{''.join(f'- {n}\n' for n in news)}

ענה בפורמט JSON בלבד:
{{
  "action": אחד מ־["קנייה","החזקה","מכירה"],
  "guidance": "הנחיה תמציתית בעברית"
}}
"""

    # שליחת בקשה ל-OpenRouter
    try:
        resp = requests.post(
          "https://api.openrouter.ai/v1/chat/completions",
          headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type":    "application/json"
          },
          json={
            "model":       "deepseek-chat:free",
            "messages": [
              {"role":"system","content":"You are a helpful investment assistant."},
              {"role":"user",  "content": prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 150
          },
          timeout=30
        )
        resp.raise_for_status()
    except Exception as e:
        app.logger.error(f"OpenRouter error: {e}")
        # נחזור ב־fallback
        return jsonify({
          "action":   "החזקה",
          "guidance": "לא הצלחתי לקבל תשובה מהשירות, אנא נסה שוב."
        })

    raw = resp.json()["choices"][0]["message"]["content"].strip()

    # ניסיון לפרסר JSON
    try:
        result = json.loads(raw)
        if not isinstance(result, dict) or "action" not in result:
            raise ValueError("No action key")
    except Exception:
        # fallback: נחפש את המילה הראשונה מתוך ["קנייה","מכירה","החזקה"]
        m = re.search(r"(קנייה|מכירה|החזקה)", raw)
        action = m.group(1) if m else "החזקה"
        result = {
            "action":   action,
            "guidance": raw
        }

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
