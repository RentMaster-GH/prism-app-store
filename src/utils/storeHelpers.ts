import { backend } from '../lib/backend';

export const STORE_CATEGORIES = [
  'Social',
  'Dating',
  'Finance',
  'Productivity',
  'Games',
  'Tools',
  'Education',
  'Health',
  'Business',
  'Other',
];

export const ALL_STORE_CATEGORIES = ['All', ...STORE_CATEGORIES];

export function getUniqueThumbnail(row: any): string {
  const candidates = [
    row?.thumbnail_url,
    row?.icon_url,
    row?.hero_image,
    row?.download_url,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && (c.startsWith('data:image/') || c.startsWith('http'))) {
      return c;
    }
  }
  const webUrl = row?.live_web_url || row?.live_app_url;
  if (typeof webUrl === 'string' && webUrl.startsWith('http') && !webUrl.endsWith('.apk')) {
    return `https://image.thum.io/get/width/600/crop/400/noanimate/${webUrl}`;
  }
  return '';
}

export async function fetchReviewRollups(): Promise<Record<string, { avg: number; count: number }>> {
  try {
    const records = await backend.list<any>('app_reviews');
    const grouped: Record<string, { sum: number; count: number }> = {};
    for (const r of records) {
      const d = r.data || {};
      if (d.is_hidden) continue;
      const appId = String(d.app_id || '');
      const rating = Number(d.rating || 0);
      if (!appId || rating <= 0) continue;
      if (!grouped[appId]) grouped[appId] = { sum: 0, count: 0 };
      grouped[appId].sum += rating;
      grouped[appId].count += 1;
    }
    const result: Record<string, { avg: number; count: number }> = {};
    for (const [id, val] of Object.entries(grouped)) {
      result[id] = {
        avg: Number((val.sum / val.count).toFixed(1)),
        count: val.count,
      };
    }
    return result;
  } catch {
    return {};
  }
}

export function normalizeCategoryMatch(rawCat: any, filterCat: string): boolean {
  if (!filterCat || filterCat === 'All') return true;
  const norm = (s: any) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  const c = norm(rawCat);
  const f = norm(filterCat);
  if (f === 'games' || f === 'game') return c.includes('game') || c.includes('laby') || c.includes('blty');
  if (f === 'tools' || f === 'tool') return c.includes('tool') || c.includes('util');
  if (f === 'other') {
    const known = ['social', 'dating', 'finance', 'productivity', 'game', 'laby', 'blty', 'tool', 'util', 'education', 'health', 'business'];
    return !known.some((k) => c.includes(k));
  }
  return c.includes(f) || f.includes(c);
}
