from flask import Flask, request, jsonify
from flask_cors import CORS

from telegram_fetcher import fetch_telegram_messages
from twitter_fetcher import fetch_twitter_tweets

app = Flask(__name__)
CORS(app)

@app.route("/news/telegram")
def telegram_news():
    channels = request.args.get("channels", "")
    all_msgs = []
    for ch in filter(None, channels.split(",")):
        try:
            msgs = fetch_telegram_messages(ch.strip(), limit=5)
            all_msgs.extend(msgs)
        except Exception as e:
            app.logger.error(f"Error fetching Telegram for {ch}: {e}")
    return jsonify(all_msgs)

@app.route("/news/twitter")
def twitter_news():
    """
    GET /news/twitter?usernames=elonmusk,otheruser
    """
    usernames = request.args.get("usernames", "")
    all_tweets = []
    for u in filter(None, usernames.split(",")):
        try:
            tweets = fetch_twitter_tweets(u.strip(), limit=5)
            all_tweets.extend(tweets)
        except Exception as e:
            app.logger.error(f"Twitter fetch error for {u}: {e}")
    return jsonify(all_tweets)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
