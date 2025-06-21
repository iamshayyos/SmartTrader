# backend/app.py
import os
import json
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from telegram_fetcher import fetch_telegram_messages
from twitter_fetcher import fetch_twitter_tweets
from openrouter_client import OpenRouterClient

load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY")
ai_client = OpenRouterClient(API_KEY)

app = Flask(__name__)
CORS(app)

@app.route("/news/telegram")
def telegram_news():
    channels = [c.strip() for c in request.args.get("channels","").split(",") if c.strip()]
    messages = []
    for ch in channels:
        try:
            messages.extend(fetch_telegram_messages(ch))
        except Exception as e:
            app.logger.error(f"Telegram fetch error for '{ch}': {e}")
    return jsonify(messages)

@app.route("/news/twitter")
def twitter_news():
    users = [u.strip() for u in request.args.get("usernames","").split(",") if u.strip()]
    tweets = []
    for u in users:
        try:
            tweets.extend(fetch_twitter_tweets(u))
        except Exception as e:
            app.logger.error(f"Twitter fetch error for '{u}': {e}")
    return jsonify(tweets)

@app.route("/action_or_free", methods=["POST"])
def action_or_free():
    data = request.get_json() or {}
    asset = data.get("asset",
                     "")
    news = data.get("news", [])
    # בונים prompt
    user_prompt = (
        f"Given the following news about {asset}:\n" +
        "\n".join(news) +
        "\nRecommend one action: קנייה, החזקה, או מכירה. "
        "Provide the recommendation and a brief guidance in Hebrew."
    )
    try:
        raw = ai_client.chat(user_prompt)
    except Exception as e:
        app.logger.error(f"AI call failed: {e}")
        return jsonify({"action": "החזקה", "guidance": "שגיאה בשירות AI"}), 500
    # parse
    match = re.search(r"(קנייה|החזקה|מכירה)", raw)
    action = match.group(1) if match else "החזקה"
    guidance = raw
    return jsonify({"action": action, "guidance": guidance})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
