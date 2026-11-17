import { backend } from '../src/lib/backend';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const records = await backend.list('public_feedback');
      return res.status(200).json({ records });
    } catch (error: any) {
      return res.status(500).json({ error: error?.message || 'Failed to load feedback' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const record = await backend.create('public_feedback', {
        ...body,
        created_at: new Date().toISOString(),
      });
      return res.status(201).json({ success: true, record });
    } catch (error: any) {
      return res.status(500).json({ error: error?.message || 'Failed to submit feedback' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
