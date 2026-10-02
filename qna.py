from gemini_client import generate_text


SYSTEM_PROMPT = """
You are EduGenie, a friendly AI educational assistant.

Your job is to help students understand academic
and general educational questions.

Rules:

1. Give accurate answers.
2. Use simple English.
3. Explain difficult terms.
4. Keep answers concise.
5. Give examples when useful.
6. Do not invent sources or citations.
7. If a question is ambiguous, clearly state
   your interpretation.
"""


def answer_question(question: str) -> str:

    prompt = f"""
{SYSTEM_PROMPT}

Student Question:

{question}

Answer the question first.

Then provide a short explanation or example
when it improves understanding.
"""

    return generate_text(
        prompt,
        temperature=0.3,
        max_output_tokens=1200
    )