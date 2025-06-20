# backend/telegram_fetcher.py
import requests
from bs4 import BeautifulSoup

def fetch_telegram_messages(channel: str, limit: int = 5):
    """
    Scrapes the last `limit` posts from t.me/s/<channel>.
    Returns a list of dicts: [{"source": channel, "text": "..."}].
    """
    url = f"https://t.me/s/{channel}"
    headers = {"User-Agent": "Mozilla/5.0"}
    resp = requests.get(url, headers=headers, timeout=10)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")
    posts = soup.find_all("div", class_="tgme_widget_message_text", limit=limit)
    
    messages = []
    for p in posts:
        text = p.get_text(" ", strip=True)
        if text:
            messages.append({"source": channel, "text": text})
    return messages
