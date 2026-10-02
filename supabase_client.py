from functools import lru_cache
import os
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_PUBLISHABLE_KEY


@lru_cache(maxsize=1)
def get_supabase_client() -> Client | None:
    if not SUPABASE_URL:
        return None
    key = SUPABASE_SECRET_KEY or SUPABASE_PUBLISHABLE_KEY
    if not key:
        return None
    try:
        return create_client(SUPABASE_URL, key)
    except Exception as e:
        print(f"[Supabase] Initialization warning: {e}")
        return None


def save_session_to_supabase(task: str, prompt: str, result: str | dict):
    client = get_supabase_client()
    if not client:
        return None
    try:
        data = {
            "task": task,
            "prompt": prompt,
            "result": result if isinstance(result, str) else str(result)
        }
        # Attempt to insert into study_sessions table if it exists
        return client.table("study_sessions").insert(data).execute()
    except Exception as e:
        # Graceful fallback if table is not yet created in Supabase project
        print(f"[Supabase] Note: {e}")
        return None
