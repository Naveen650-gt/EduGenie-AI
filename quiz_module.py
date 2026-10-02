from gemini_client import generate_text
from utils import parse_json_response


def generate_quiz(
    passage: str,
    num_questions: int = 3
):

    prompt = f"""
Create {num_questions} multiple-choice
questions from the passage below.

Return ONLY valid JSON.

Use exactly this structure:

{{
    "questions": [
        {{
            "question": "Question text",
            "options": [
                "Option A",
                "Option B",
                "Option C",
                "Option D"
            ],
            "answer": "Option A",
            "explanation": "Short explanation"
        }}
    ]
}}

Rules:

- Exactly 4 options.
- One correct answer.
- The answer must exactly match
  one option.
- Questions must come from the passage.
- Avoid trick questions.
- Keep explanations short.
- Do not use Markdown.
- Do not add extra text.

Passage:

{passage}
"""

    raw_response = generate_text(
        prompt,
        temperature=0.2,
        max_output_tokens=2200
    )

    data = parse_json_response(
        raw_response
    )

    if not isinstance(
        data,
        dict
    ):

        raise ValueError(
            "Invalid quiz response."
        )

    questions = data.get(
        "questions"
    )

    if not isinstance(
        questions,
        list
    ):

        raise ValueError(
            "Quiz questions are missing."
        )

    questions = questions[
        :num_questions
    ]

    for question in questions:

        if not isinstance(
            question,
            dict
        ):

            raise ValueError(
                "Invalid question."
            )

        options = question.get(
            "options"
        )

        answer = question.get(
            "answer"
        )

        if not isinstance(
            options,
            list
        ):

            raise ValueError(
                "Options are invalid."
            )

        if len(options) != 4:

            raise ValueError(
                "Each question needs "
                "exactly four options."
            )

        if answer not in options:

            raise ValueError(
                "Answer must match "
                "one of the options."
            )

    return {
        "questions": questions
    }