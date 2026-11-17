export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserPayload {
  sub: string;
  email: string;
  appId: string;
  role: string;
  iat: number;
  exp: number;
}

export interface CollectionRecord<T = Record<string, any>> {
  id: string;
  app_id: string;
  collection: string;
  owner_id: string;
  data: T;
  created_at: string;
  updated_at: string;
}

export class CustomBackendClient {
  private baseUrl: string;
  private appId: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;
  private deviceAuthPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string, appId: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.appId = appId;

    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem(`${this.appId}_access_token`);
      this.refreshToken = localStorage.getItem(`${this.appId}_refresh_token`);
    }
  }

  private setTokens(tokens: AuthTokens) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${this.appId}_access_token`, tokens.accessToken);
      localStorage.setItem(`${this.appId}_refresh_token`, tokens.refreshToken);
    }
  }

  public clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${this.appId}_access_token`);
      localStorage.removeItem(`${this.appId}_refresh_token`);
    }
  }

  public isAuthenticated(): boolean {
    return Boolean(this.accessToken);
  }

  private getOrCreateDeviceUID(): string {
    if (typeof window === 'undefined') return 'PRISM-UID-SERVER-DEFAULT';
    let uid = localStorage.getItem('prism_user_uid') || localStorage.getItem('prism_user_uid_backup');
    if (!uid) {
      uid =
        'PRISM-UID-' +
        Math.random().toString(36).substring(2, 6).toUpperCase() +
        '-' +
        Math.random().toString(36).substring(2, 5).toUpperCase();
      localStorage.setItem('prism_user_uid', uid);
      localStorage.setItem('prism_user_uid_backup', uid);
    }
    return uid;
  }

  private async ensureDeviceSession(): Promise<boolean> {
    if (this.accessToken) return true;
    if (this.deviceAuthPromise) return this.deviceAuthPromise;

    this.deviceAuthPromise = (async () => {
      try {
        const uid = this.getOrCreateDeviceUID();
        const safeSlug = uid.toLowerCase().replace(/[^a-z0-9]/g, '');
        const email = `${safeSlug}@device.prism.local`;
        const password = `PrismDevice#${safeSlug}#2026!`;

        // Try silent login first
        const loginRes = await fetch(`${this.baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appId: this.appId, email, password }),
        });

        if (loginRes.ok) {
          const data = await loginRes.json();
          if (data.accessToken && data.refreshToken) {
            this.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
            return true;
          }
        }

        // Otherwise auto-register silent device account
        const regRes = await fetch(`${this.baseUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appId: this.appId, email, password, role: 'user' }),
        });

        if (regRes.ok) {
          const data = await regRes.json();
          if (data.accessToken && data.refreshToken) {
            this.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
            return true;
          }
        }

        return false;
      } catch {
        return false;
      } finally {
        this.deviceAuthPromise = null;
      }
    })();

    return this.deviceAuthPromise;
  }

  private async request<T>(path: string, options: RequestInit = {}, retry = true, requireSession = false): Promise<T> {
    if (requireSession && !this.accessToken) {
      await this.ensureDeviceSession();
    }

    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }

    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && retry) {
      if (this.refreshToken) {
        const refreshed = await this.attemptTokenRefresh();
        if (refreshed) {
          return this.request<T>(path, options, false, requireSession);
        }
      }
      if (requireSession) {
        this.clearTokens();
        const reAuthed = await this.ensureDeviceSession();
        if (reAuthed) {
          return this.request<T>(path, options, false, false);
        }
      }
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data as T;
  }

  private async attemptTokenRefresh(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });

        if (!response.ok) {
          this.clearTokens();
          return false;
        }

        const data = await response.json();
        this.setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
        return true;
      } catch {
        this.clearTokens();
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  public async register(email: string, password: string, role = 'user') {
    const data = await this.request<{
      user: { id: string; email: string; role: string };
      accessToken: string;
      refreshToken: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ appId: this.appId, email, password, role }),
    });

    this.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data.user;
  }

  public async login(email: string, password: string) {
    const data = await this.request<{
      user: { id: string; email: string; role: string };
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ appId: this.appId, email, password }),
    });

    this.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data.user;
  }

  public async logout() {
    try {
      if (this.refreshToken) {
        await this.request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        }, false);
      }
    } finally {
      this.clearTokens();
    }
  }

  public async getMe(): Promise<UserPayload> {
    const res = await this.request<{ payload: UserPayload }>('/me', { method: 'GET' }, true, true);
    return res.payload;
  }

  public async list<T = Record<string, any>>(collection: string): Promise<CollectionRecord<T>[]> {
    const res = await this.request<{ records: CollectionRecord<T>[] }>(
      `/data/${this.appId}/${collection}`,
      { method: 'GET' },
      true,
      false
    );
    return res.records;
  }

  public async create<T = Record<string, any>>(collection: string, data: T): Promise<CollectionRecord<T>> {
    const res = await this.request<{ record: CollectionRecord<T> }>(
      `/data/${this.appId}/${collection}`,
      {
        method: 'POST',
        body: JSON.stringify({ data }),
      },
      true,
      true
    );
    return res.record;
  }

  public async update<T = Record<string, any>>(collection: string, id: string, data: Partial<T>): Promise<CollectionRecord<T>> {
    const res = await this.request<{ record: CollectionRecord<T> }>(
      `/data/${this.appId}/${collection}/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify({ data }),
      },
      true,
      true
    );
    return res.record;
  }

  public async remove(collection: string, id: string): Promise<void> {
    await this.request(
      `/data/${this.appId}/${collection}/${id}`,
      { method: 'DELETE' },
      true,
      true
    );
  }
}
