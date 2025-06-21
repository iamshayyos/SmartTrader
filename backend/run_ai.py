# backend/run_ai.py

import os
from dotenv import load_dotenv
from ai_client import AIClient

def main():
    # טען את משתני הסביבה מ־.env
    load_dotenv()

    # קבל את המפתח
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("ERROR: לא זוהה OPENROUTER_API_KEY במשתני הסביבה.")
        print("וודא שקובץ .env נמצא באותה תיקיה ושורה OPENROUTER_API_KEY=... קיימת בו.")
        return

    # אתחול הלקוח
    ai = AIClient(api_key)

    print("Interactive AI client. Type 'exit' or 'quit' to stop.")
    while True:
        user_input = input("Enter prompt: ")
        if user_input.strip().lower() in ('exit', 'quit'):
            print("Exiting.")
            break
        try:
            response = ai.chat(
                model="deepseek-chat:free",
                system_prompt="You are a helpful assistant.",
                user_prompt=user_input
            )
            print("\nModel response:\n", response, "\n")
        except Exception as e:
            print(f"Error calling AI model: {e}")

if __name__ == '__main__':
    main()
