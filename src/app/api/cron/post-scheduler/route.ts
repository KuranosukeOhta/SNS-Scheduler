import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET() {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET is not set.' }, { status: 500 });
  }

  try {
    const supabaseFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/post-scheduler`;

    const response = await fetch(supabaseFunctionUrl, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to invoke Supabase function: ${response.status} ${response.statusText}. Body: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json({ message: 'Successfully triggered Supabase function.', data });

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error triggering Supabase function:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
} 