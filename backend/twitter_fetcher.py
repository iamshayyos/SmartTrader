# backend/twitter_fetcher.py
import requests

# ─── Replace with your own Bearer Token ───
BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAOh72gEAAAAAyGLUmSxwXr6KCXjK5zGVxteMy7M%3DJdEaKTrEzgTMqbax9BsVG0TyqovD67jmTeZxN4CjDJoc1Ertcs"

HEADERS = {
    "Authorization": f"Bearer {BEARER_TOKEN}",
    "User-Agent": "SmartTrader/1.0"
}

def fetch_twitter_tweets(username: str, limit: int = 5):
    """
    Fetches up to `limit` recent tweets from the given username
    via Twitter API v2. Returns a list of {"source": username, "text": tweet} dicts.
    """

    # 1) Lookup user ID by username
    url_user = f"https://api.twitter.com/2/users/by/username/{username}"
    resp_user = requests.get(url_user, headers=HEADERS, timeout=10)
    resp_user.raise_for_status()
    user_id = resp_user.json()["data"]["id"]

    # 2) Fetch their tweets by user ID
    url_tweets = f"https://api.twitter.com/2/users/{user_id}/tweets"
    params = {
        "max_results": limit,
        "tweet.fields": "text,created_at"
    }
    resp_tweets = requests.get(url_tweets, headers=HEADERS, params=params, timeout=10)
    resp_tweets.raise_for_status()

    tweets_data = resp_tweets.json().get("data", [])
    return [
        {"source": username, "text": t["text"]}
        for t in tweets_data
    ]


# Quick test when run from CLI
if __name__ == "__main__":
    import argparse, json
    parser = argparse.ArgumentParser()
    parser.add_argument("-u", "--user", required=True, help="Twitter username (no @)")
    parser.add_argument("-n", "--limit", type=int, default=5)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    tweets = fetch_twitter_tweets(args.user, args.limit)
    if args.json:
        print(json.dumps(tweets, ensure_ascii=False, indent=2))
    else:
        for t in tweets:
            print(f"[{t['source']}] {t['text']}\n")
