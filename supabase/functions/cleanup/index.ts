import { backend } from '../../../src/lib/backend';

export async function runCleanup() {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const records = await backend.list<any>('apps');
  const expired = records.filter((r) => {
    if (r.data?.status !== 'deleted') return false;
    const deletedTs = r.data?.deleted_at ? new Date(r.data.deleted_at).getTime() : 0;
    return deletedTs > 0 && deletedTs < thirtyDaysAgo;
  });

  const removedIds: string[] = [];
  for (const item of expired) {
    await backend.remove('apps', item.id);
    removedIds.push(item.id);
  }

  return {
    cleaned: removedIds.length,
    ids: removedIds,
    at: new Date().toISOString(),
  };
}
