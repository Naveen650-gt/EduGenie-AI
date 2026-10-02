from gemini_client import generate_text


def get_learning_recommendations(topic: str, level: str = "beginner") -> str:
    prompt = f"""
Create a simple learning path for {topic}.

Student level: {level}

Give:
1. Beginner topics
2. Intermediate topics
3. Advanced topics
4. A simple weekly timeline
5. Two project ideas

Keep the response short and clear.
"""

    return generate_text(prompt)

