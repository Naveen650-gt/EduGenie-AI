import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    // Test auth configuration & health
    const { data, error } = await supabase.auth.getSession();
    
    return NextResponse.json({
      status: 'ok',
      service: 'Supabase Server',
      url: process.env.SUPABASE_URL || 'https://ytzskfaeevhotviurven.supabase.co',
      configured: true,
      authStatus: error ? error.message : 'ready'
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error?.message || 'Supabase connection error' },
      { status: 500 }
    );
  }
}
