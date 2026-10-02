from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field

from qna import answer_question
from explanation_module import explain_topic
from quiz_module import generate_quiz
from summary_module import summarize_text
from learning_path import get_learning_recommendations


app = FastAPI(
    title="EduGenie - Gemini Powered Learning Assistant",
    version="1.0.0",
    description="AI-powered educational learning assistant."
)

# Enable CORS for Next.js frontend and cross-origin clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Static files
app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)

templates = Jinja2Templates(
    directory="templates"
)


# -----------------------------
# Request Models
# -----------------------------

class QuestionRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=1,
        max_length=10000
    )


class TextRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=20000
    )


class QuizRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=20000
    )

    num_questions: int = Field(
        default=3,
        ge=1,
        le=10
    )


class LearningPathRequest(BaseModel):
    topic: str = Field(
        ...,
        min_length=1,
        max_length=5000
    )

    level: str = Field(
        default="beginner",
        max_length=50
    )


# -----------------------------
# Frontend
# -----------------------------

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={"request": request}
    )


# -----------------------------
# Health Check
# -----------------------------

@app.get("/health")
async def health():

    return {
        "status": "ok",
        "service": "EduGenie"
    }


# -----------------------------
# Q&A
# -----------------------------

@app.post("/qa")
async def qa(payload: QuestionRequest):

    try:

        result = answer_question(
            payload.question
        )

        return {
            "success": True,
            "result": result
        }

    except Exception as error:

        raise HTTPException(
            status_code=502,
            detail=str(error)
        )


# -----------------------------
# Explanation
# -----------------------------

@app.post("/explain")
async def explain(payload: TextRequest):

    try:

        result = explain_topic(
            payload.text
        )

        return {
            "success": True,
            "result": result
        }

    except Exception as error:

        raise HTTPException(
            status_code=502,
            detail=str(error)
        )


# -----------------------------
# Quiz
# -----------------------------

@app.post("/quiz")
async def quiz(payload: QuizRequest):

    try:

        result = generate_quiz(
            payload.text,
            payload.num_questions
        )

        return {
            "success": True,
            "result": result
        }

    except Exception as error:

        raise HTTPException(
            status_code=502,
            detail=str(error)
        )


# -----------------------------
# Summarization
# -----------------------------

@app.post("/summarize")
async def summarize(payload: TextRequest):

    try:

        result = summarize_text(
            payload.text
        )

        return {
            "success": True,
            "result": result
        }

    except Exception as error:

        raise HTTPException(
            status_code=502,
            detail=str(error)
        )


# -----------------------------
# Learning Path
# -----------------------------

@app.post("/learn/recommendations")
async def learning_recommendations(
    payload: LearningPathRequest
):

    try:

        result = get_learning_recommendations(
            payload.topic,
            payload.level
        )

        return {
            "success": True,
            "result": result
        }

    except Exception as error:

        raise HTTPException(
            status_code=502,
            detail=str(error)
        )