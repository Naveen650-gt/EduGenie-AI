import { NextResponse } from 'next/server';

function getBackendUrl(): string {
  const url = process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://127.0.0.1:8000';
  return url.replace(/\/$/, '');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/learn/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, detail: error?.message || 'Failed to communicate with AI Backend' },
      { status: 502 }
    );
  }
}
