import { NextResponse } from 'next/server';

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://127.0.0.1:8000';

export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_URL}/health`, {
      cache: 'no-store'
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Backend unreachable' },
      { status: 503 }
    );
  }
}
