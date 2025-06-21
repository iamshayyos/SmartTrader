# openrouter_client.py
import os
import requests
from dotenv import load_dotenv

class OpenRouterClient:
    """
    לקוח ל-OpenRouter באמצעות המודל deepseek/deepseek-r1-0528:free
    שולח את השאלה כפי שהיא ומחזיר את כל הפלט, כולל המשך במידה והמודל נכנס ל-length truncation.
    """
    def __init__(self,
                 api_key: str = None,
                 base_url: str = "https://openrouter.ai/api/v1",
                 referer: str = None,
                 title: str = None):
        load_dotenv()
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        if not self.api_key:
            raise ValueError("יש להגדיר OPENROUTER_API_KEY בסביבת הריצה או בקובץ .env")
        self.base_url = base_url.rstrip("/")
        self.referer = referer or os.getenv("HTTP_REFERER")
        self.title = title or os.getenv("X_TITLE")

    def chat(self,
             user_prompt: str,
             model: str = "deepseek/deepseek-r1-0528:free",
             temperature: float = 0.2,
             max_tokens: int = 1024) -> str:
        """
        שולח בקשה ראשונית ומחזיר את כל התוכן כולל המשך אם ה-finish_reason שווה 'length'.
        """
        def send_request(messages):
            url = f"{self.base_url}/chat/completions"
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type":  "application/json",
            }
            if self.referer:
                headers["HTTP-Referer"] = self.referer
            if self.title:
                headers["X-Title"] = self.title
            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            resp = requests.post(url, headers=headers, json=payload, timeout=30)
            resp.raise_for_status()
            return resp.json()

        # סדר שליחת הודעות
        messages = [
            {"role": "user", "content": user_prompt}
        ]
        # ביצוע הבקשה הראשונית
        data = send_request(messages)
        choice = data.get("choices", [])[0]
        content = choice.get("message", {}).get("content", "")
        finish = choice.get("finish_reason")
        full_text = content

        # במידה שנגמרה בתוצאה (length), נשלח ביקוש להמשך
        while finish == "length":
            cont_msg = [{"role": "user", "content": "Continue."}]
            data = send_request(cont_msg)
            choice = data.get("choices", [])[0]
            more = choice.get("message", {}).get("content", "")
            full_text += more
            finish = choice.get("finish_reason")

        return full_text.strip()

if __name__ == '__main__':
    load_dotenv()
    client = OpenRouterClient()
    print("Interactive OpenRouter client. Type 'exit' or 'quit' to stop.")
    while True:
        prompt = input("Your prompt: ")
        if prompt.strip().lower() in ('exit', 'quit'):
            break
        try:
            answer = client.chat(prompt)
            print(f"\nFull Model Answer:\n{answer}\n")
        except Exception as e:
            print(f"Error calling OpenRouter: {e}")
