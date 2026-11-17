declare const process: { env?: Record<string, string | undefined> };

const BACKEND_URL =
  process?.env?.VITE_BACKEND_URL ||
  process?.env?.NEXT_PUBLIC_BACKEND_URL ||
  'https://api.credibleartisans.com';

const APP_ID =
  process?.env?.VITE_APP_ID ||
  process?.env?.NEXT_PUBLIC_APP_ID ||
  'prism-app-store';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();

    const upstream = await fetch(`${BACKEND_URL}/data/${APP_ID}/public_feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization')
          ? { Authorization: request.headers.get('authorization') as string }
          : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await upstream.json().catch(() => ({}));
    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || 'Failed to submit feedback' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function GET(): Promise<Response> {
  try {
    const upstream = await fetch(`${BACKEND_URL}/data/${APP_ID}/public_feedback`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await upstream.json().catch(() => ({ records: [] }));
    return new Response(JSON.stringify(data), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || 'Failed to load feedback' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
