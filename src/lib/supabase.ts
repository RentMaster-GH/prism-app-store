import { backend } from './backend';

type FilterOp =
  | { type: 'eq'; column: string; value: any }
  | { type: 'neq'; column: string; value: any }
  | { type: 'lt'; column: string; value: any }
  | { type: 'gt'; column: string; value: any }
  | { type: 'in'; column: string; value: any[] }
  | { type: 'or'; expr: string };

class CustomQueryBuilder implements PromiseLike<{ data: any; error: any }> {
  private table: string;
  private action: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';
  private payload: any = null;
  private filters: FilterOp[] = [];
  private orderBy: { column: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private isSingle = false;

  constructor(table: string) {
    this.table = table;
  }

  select(_columns = '*') {
    if (this.action !== 'insert' && this.action !== 'update' && this.action !== 'upsert') {
      this.action = 'select';
    }
    return this;
  }

  insert(rows: any) {
    this.action = 'insert';
    this.payload = rows;
    return this;
  }

  upsert(rows: any) {
    this.action = 'upsert';
    this.payload = rows;
    return this;
  }

  update(values: any) {
    this.action = 'update';
    this.payload = values;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push({ type: 'neq', column, value });
    return this;
  }

  lt(column: string, value: any) {
    this.filters.push({ type: 'lt', column, value });
    return this;
  }

  gt(column: string, value: any) {
    this.filters.push({ type: 'gt', column, value });
    return this;
  }

  in(column: string, value: any[]) {
    this.filters.push({ type: 'in', column, value });
    return this;
  }

  or(expr: string) {
    this.filters.push({ type: 'or', expr });
    return this;
  }

  textSearch(_column: string, _query: string) {
    return this;
  }

  order(column: string, opts?: { ascending?: boolean }) {
    this.orderBy = { column, ascending: opts?.ascending !== false };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isSingle = true;
    return this;
  }

  private matchesFilters(row: any): boolean {
    for (const f of this.filters) {
      if (f.type === 'eq') {
        const val = f.column === 'uuid' ? (row.uuid ?? row.id) : row[f.column];
        if (val !== f.value) return false;
      } else if (f.type === 'neq') {
        const val = f.column === 'uuid' ? (row.uuid ?? row.id) : row[f.column];
        if (val === f.value) return false;
      } else if (f.type === 'lt') {
        if (!(row[f.column] < f.value)) return false;
      } else if (f.type === 'gt') {
        if (!(row[f.column] > f.value)) return false;
      } else if (f.type === 'in') {
        if (!Array.isArray(f.value) || !f.value.includes(row[f.column])) return false;
      } else if (f.type === 'or') {
        const clauses = f.expr.split(',');
        const anyMatch = clauses.some((clause) => {
          const parts = clause.split('.');
          if (parts.length >= 3 && parts[1] === 'ilike') {
            const col = parts[0];
            const pattern = parts.slice(2).join('.').replace(/%/g, '').toLowerCase();
            return String(row[col] || '').toLowerCase().includes(pattern);
          }
          return true;
        });
        if (!anyMatch) return false;
      }
    }
    return true;
  }

  private async execute(): Promise<{ data: any; error: any }> {
    try {
      const records = await backend.list<any>(this.table);
      const flatRows = records.map((r) => ({
        id: r.id,
        uuid: r.data?.uuid || r.id,
        created_at: r.created_at,
        updated_at: r.updated_at,
        ...r.data,
      }));

      if (this.action === 'select') {
        let result = flatRows.filter((row) => this.matchesFilters(row));

        if (this.orderBy) {
          const { column, ascending } = this.orderBy;
          result.sort((a, b) => {
            const av = a[column] ?? '';
            const bv = b[column] ?? '';
            if (av < bv) return ascending ? -1 : 1;
            if (av > bv) return ascending ? 1 : -1;
            return 0;
          });
        }

        if (this.limitCount !== null) {
          result = result.slice(0, this.limitCount);
        }

        return {
          data: this.isSingle ? (result[0] ?? null) : result,
          error: null,
        };
      }

      if (this.action === 'insert' || this.action === 'upsert') {
        const items = Array.isArray(this.payload) ? this.payload : [this.payload];
        const createdList: any[] = [];
        for (const item of items) {
          const created = await backend.create<any>(this.table, item);
          createdList.push({
            id: created.id,
            uuid: created.data?.uuid || created.id,
            created_at: created.created_at,
            updated_at: created.updated_at,
            ...created.data,
          });
        }
        return {
          data: this.isSingle ? createdList[0] : createdList,
          error: null,
        };
      }

      if (this.action === 'update') {
        const targets = flatRows.filter((row) => this.matchesFilters(row));
        const updatedList: any[] = [];
        for (const target of targets) {
          const updated = await backend.update<any>(this.table, target.id, this.payload);
          updatedList.push({
            id: updated.id,
            uuid: updated.data?.uuid || updated.id,
            created_at: updated.created_at,
            updated_at: updated.updated_at,
            ...updated.data,
          });
        }
        return {
          data: this.isSingle ? (updatedList[0] ?? null) : updatedList,
          error: null,
        };
      }

      if (this.action === 'delete') {
        const targets = flatRows.filter((row) => this.matchesFilters(row));
        for (const target of targets) {
          await backend.remove(this.table, target.id);
        }
        return { data: targets, error: null };
      }

      return { data: null, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  then<TResult1 = { data: any; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export const supabase = {
  from(table: string) {
    return new CustomQueryBuilder(table);
  },
  channel(_name: string) {
    const sub = {
      on() {
        return sub;
      },
      subscribe() {
        return sub;
      },
    };
    return sub;
  },
  removeChannel(_channel: any) {
    return Promise.resolve('ok');
  },
  async rpc(fnName: string, args?: Record<string, any>) {
    if (fnName === 'increment_install' && args?.target_uuid) {
      try {
        const apps = await backend.list<any>('apps');
        const match = apps.find(
          (a) => a.id === args.target_uuid || a.data?.uuid === args.target_uuid
        );
        if (match) {
          const current = Number(match.data?.install_count || match.data?.downloads || 0);
          await backend.update('apps', match.id, {
            install_count: current + 1,
            downloads: current + 1,
          });
        }
      } catch {}
    }
    return { data: null, error: null };
  },
  auth: {
    async getUser() {
      try {
        const { payload } = await backend.getMe();
        return {
          data: {
            user: {
              id: payload.sub,
              email: payload.email,
              user_metadata: payload.custom || {},
            },
          },
          error: null,
        };
      } catch {
        return { data: { user: null }, error: null };
      }
    },
    async getSession() {
      try {
        const { payload } = await backend.getMe();
        return {
          data: {
            session: {
              user: {
                id: payload.sub,
                email: payload.email,
                user_metadata: payload.custom || {},
              },
            },
          },
          error: null,
        };
      } catch {
        return { data: { session: null }, error: null };
      }
    },
    onAuthStateChange() {
      return { data: { subscription: { unsubscribe() {} } } };
    },
  },
  storage: {
    from(_bucket: string) {
      return {
        async upload(path: string, file: File) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({ data: { path, fullPath: reader.result }, error: null });
            };
            reader.onerror = (error) => resolve({ data: null, error });
            reader.readAsDataURL(file);
          });
        },
        getPublicUrl(path: string) {
          return { data: { publicUrl: path } };
        },
      };
    },
  },
};
