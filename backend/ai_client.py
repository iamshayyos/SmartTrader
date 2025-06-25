import os
import requests

class AIClient:
    """
    לקוח פשוט ל-OpenRouter (או כל API דומה).
    """
    def __init__(self, api_key: str = None, base_url: str = "https://api.openrouter.ai/v1"):
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        self.base_url = base_url
        if not self.api_key:
            raise ValueError("API key for OpenRouter לא מוגדר")

    def chat(self,
             model: str,
             system_prompt: str,
             user_prompt: str,
             temperature: float = 0.2,
             max_tokens: int = 150) -> str:
        """
        שולח הודעת chat ומחזיר את התוכן של ההודעה מחדר ה-choices.
        """
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type":    "application/json"
        }
        payload = {
            "model":      model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_prompt}
            ],
            "temperature": temperature,
            "max_tokens":  max_tokens
        }

        resp = requests.post(url, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()
