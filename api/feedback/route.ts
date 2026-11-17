export default async function handler(req: any, res: any) {
  const backendUrl =
    process.env.VITE_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'https://api.credibleartisans.com';
  const appId =
    process.env.VITE_APP_ID ||
    process.env.NEXT_PUBLIC_APP_ID ||
    'prism-app-store';

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const response = await fetch(`${backendUrl}/data/${appId}/public_feedback`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const email = `feedback-${Date.now()}@${appId}.local`;
      const password = `PrismFeedback_${appId}_2026!`;

      await fetch(`${backendUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, email, password, metadata: { role: 'feedback' } }),
      }).catch(() => null);

      const loginRes = await fetch(`${backendUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, email, password }),
      });

      const loginData = await loginRes.json().catch(() => ({}));
      const token = loginData?.accessToken || loginData?.token || '';

      const createRes = await fetch(`${backendUrl}/data/${appId}/public_feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...body,
          created_at: body.created_at || new Date().toISOString(),
        }),
      });

      const result = await createRes.json().catch(() => ({}));
      return res.status(createRes.status).json(result);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
