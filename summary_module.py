from gemini_client import generate_text


def summarize_text(text: str):

    prompt = f"""
You are EduGenie's educational summarization
assistant.

Summarize the following educational text.

Requirements:

- Keep important information.
- Remove repetition.
- Use simple English.
- Make it useful for quick revision.
- Do not add information that is not
  present in the original text.

Format:

Short Summary:

Then provide:

Key Points:
- Point 1
- Point 2
- Point 3

Educational Text:

{text}
"""

    return generate_text(
        prompt,
        temperature=0.25,
        max_output_tokens=1600
    )