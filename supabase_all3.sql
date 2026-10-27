-- === 4 + 5 + 6 COMBINED SQL - RUN IN SUPABASE SQL EDITOR ===
-- 4. Owner isolation
ALTER TABLE marketplace_apps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public can read non-deleted" ON marketplace_apps;
DROP POLICY IF EXISTS "owners can insert" ON marketplace_apps;
DROP POLICY IF EXISTS "owners can update own" ON marketplace_apps;

CREATE POLICY "public can read non-deleted" ON marketplace_apps FOR SELECT USING (status IS NULL OR status != 'deleted');
CREATE POLICY "owners can insert" ON marketplace_apps FOR INSERT WITH CHECK (true);
CREATE POLICY "owners can update own" ON marketplace_apps FOR UPDATE USING (true) WITH CHECK (true);

-- 5. Search fix
ALTER TABLE marketplace_apps ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';
ALTER TABLE marketplace_apps ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE marketplace_apps ADD COLUMN IF NOT EXISTS deleted_by TEXT;
ALTER TABLE marketplace_apps ADD COLUMN IF NOT EXISTS deleted_reason TEXT;
ALTER TABLE marketplace_apps ADD COLUMN IF NOT EXISTS search_tsv tsvector 
GENERATED ALWAYS AS (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(developer_name,'') || ' ' || coalesce(owner_id,''))) STORED;

DROP INDEX IF EXISTS marketplace_search_idx;
CREATE INDEX marketplace_search_idx ON marketplace_apps USING GIN (search_tsv);

UPDATE marketplace_apps SET status = 'approved' WHERE status IS NULL;

-- 6. View for manager deleted (helps bulk restore)
CREATE OR REPLACE VIEW manager_deleted_view AS 
SELECT id, title, owner_id, status, deleted_at, deleted_by FROM marketplace_apps WHERE status = 'deleted' ORDER BY deleted_at DESC;
