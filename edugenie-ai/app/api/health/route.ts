import { NextResponse } from 'next/server';

function getBackendUrl(): string {
  const url = process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://127.0.0.1:8000';
  return url.replace(/\/$/, '');
}

export async function GET() {
  try {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/health`, {
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
