from functools import lru_cache

from google import genai

from config import (
    GEMINI_API_KEY,
    GEMINI_MODEL
)


class GeminiConfigurationError(
    RuntimeError
):
    pass


@lru_cache(maxsize=1)
def get_client():

    if not GEMINI_API_KEY:

        raise GeminiConfigurationError(
            "GEMINI_API_KEY is missing. "
            "Please add your Gemini API key "
            "inside the .env file."
        )

    return genai.Client(
        api_key=GEMINI_API_KEY
    )


def generate_text(
    prompt: str,
    temperature: float = 0.4,
    max_output_tokens: int = 2048
):

    client = get_client()

    response = client.models.generate_content(

        model=GEMINI_MODEL,

        contents=prompt,

        config={
            "temperature": temperature,
            "max_output_tokens": max_output_tokens
        }
    )

    text = getattr(
        response,
        "text",
        None
    )

    if not text:

        raise RuntimeError(
            "Gemini returned an empty response."
        )

    return text.strip()