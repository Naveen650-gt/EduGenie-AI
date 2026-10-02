import json
import re


def clean_json_block(text: str) -> str:

    cleaned = text.strip()

    # Remove markdown JSON block
    cleaned = re.sub(
        r"^```(?:json)?\s*",
        "",
        cleaned,
        flags=re.IGNORECASE
    )

    cleaned = re.sub(
        r"\s*```$",
        "",
        cleaned
    )

    # Find JSON beginning
    possible_starts = [
        cleaned.find("{"),
        cleaned.find("[")
    ]

    valid_starts = [
        value
        for value in possible_starts
        if value >= 0
    ]

    if valid_starts:

        start = min(valid_starts)

        if start > 0:
            cleaned = cleaned[start:]

    # Remove text after JSON
    last_object = cleaned.rfind("}")

    last_array = cleaned.rfind("]")

    last_position = max(
        last_object,
        last_array
    )

    if last_position >= 0:

        cleaned = cleaned[
            :last_position + 1
        ]

    return cleaned.strip()


def parse_json_response(text: str):

    cleaned = clean_json_block(
        text
    )

    return json.loads(cleaned)