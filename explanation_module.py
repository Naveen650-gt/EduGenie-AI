from config import (
    USE_LOCAL_EXPLANATION,
    LOCAL_EXPLANATION_MODEL
)

from gemini_client import generate_text


def local_explanation(topic: str):

    from transformers import pipeline

    generator = pipeline(
        "text2text-generation",
        model=LOCAL_EXPLANATION_MODEL,
        tokenizer=LOCAL_EXPLANATION_MODEL
    )

    prompt = f"""
Explain the following topic to a beginner
using very simple English.

Topic:

{topic}

Use:

1. Simple definition
2. How it works
3. Key points
4. One example
5. One-line recap
"""

    result = generator(
        prompt,
        max_new_tokens=300,
        do_sample=False
    )

    return result[0][
        "generated_text"
    ].strip()


def explain_topic(topic: str):

    # Optional LaMini model
    if USE_LOCAL_EXPLANATION:

        try:

            return local_explanation(
                topic
            )

        except Exception:

            # Fall back to Gemini
            pass

    prompt = f"""
You are EduGenie's concept explanation tutor.

Explain the following topic to a beginner.

Topic:

{topic}

Use this structure:

1. Simple definition
2. How it works
3. Key points
4. Easy example
5. One-line recap

Use simple English.

Avoid unnecessary technical jargon.
"""

    return generate_text(
        prompt,
        temperature=0.3,
        max_output_tokens=1400
    )