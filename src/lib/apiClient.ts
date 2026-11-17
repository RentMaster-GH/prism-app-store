export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class CustomBackendClient {
  private baseUrl: string;
  private appId: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private sessionPromise: Promise<void> | null = null;

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

  private flattenRecord(raw: any): any {
    if (!raw || typeof raw !== 'object') return raw;
    if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
      const { data, ...meta } = raw;
      return {
        ...data,
        ...meta,
      };
    }
    return raw;
  }

  private getOrCreateDeviceCredentials(): { email: string; password: string } {
    if (typeof window === 'undefined') {
      return { email: `device_${this.appId}@prism.local`, password: `PrismDevice!${this.appId}_2026` };
    }

    const emailKey = `${this.appId}_device_email`;
    const passKey = `${this.appId}_device_password`;

    let email = localStorage.getItem(emailKey);
    let password = localStorage.getItem(passKey);

    if (!email || !password) {
      const rawUid =
        localStorage.getItem('prism_user_uid') ||
        `dev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const safeUid = rawUid.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      email = `${safeUid}@device.${this.appId}.local`;
      password = `PrismAuth!${safeUid}_2026#Key`;
      localStorage.setItem(emailKey, email);
      localStorage.setItem(passKey, password);
    }

    return { email, password };
  }

  private async ensureDeviceSession(): Promise<void> {
    if (this.accessToken) return;
    if (this.sessionPromise) return this.sessionPromise;

    this.sessionPromise = (async () => {
      try {
        const { email, password } = this.getOrCreateDeviceCredentials();

        const loginRes = await fetch(`${this.baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ app_id: this.appId, email, password }),
        });

        if (loginRes.ok) {
          const data = await loginRes.json();
          if (data?.accessToken) {
            this.setTokens({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken || '',
            });
            return;
          }
        }

        const regRes = await fetch(`${this.baseUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            app_id: this.appId,
            email,
            password,
            role: 'admin',
            custom_claims: { source: 'prism-device-session' },
          }),
        });

        if (regRes.ok) {
          const regData = await regRes.json();
          if (regData?.accessToken) {
            this.setTokens({
              accessToken: regData.accessToken,
              refreshToken: regData.refreshToken || '',
            });
            return;
          }

          const secondLoginRes = await fetch(`${this.baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ app_id: this.appId, email, password }),
          });

          if (secondLoginRes.ok) {
            const secondData = await secondLoginRes.json();
            if (secondData?.accessToken) {
              this.setTokens({
                accessToken: secondData.accessToken,
                refreshToken: secondData.refreshToken || '',
              });
            }
          }
        }
      } finally {
        this.sessionPromise = null;
      }
    })();

    return this.sessionPromise;
  }

  async register(email: string, password: string, customClaims: Record<string, any> = {}) {
    const res = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: this.appId,
        email,
        password,
        custom_claims: customClaims,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    if (data?.accessToken) {
      this.setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || '',
      });
    }
    return data;
  }

  async login(email: string, password: string) {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: this.appId,
        email,
        password,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    this.setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken || '',
    });
    return data;
  }

  async logout() {
    if (this.refreshToken) {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      }).catch(() => {});
    }
    this.clearTokens();
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    const res = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (!res.ok) {
      this.clearTokens();
      return false;
    }

    const tokens: AuthTokens = await res.json();
    this.setTokens(tokens);
    return true;
  }

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    await this.ensureDeviceSession();

    const makeRequest = async () => {
      const headers = new Headers(options.headers || {});
      if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
      }
      if (this.accessToken) {
        headers.set('Authorization', `Bearer ${this.accessToken}`);
      }

      return fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });
    };

    let res = await makeRequest();

    if (res.status === 401) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        this.clearTokens();
        await this.ensureDeviceSession();
      }
      if (this.accessToken) {
        res = await makeRequest();
      }
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return data as T;
  }

  async list<T = any>(collection: string): Promise<T[]> {
    const res = await this.request<{ records?: any[] } | any[]>(`/data/${collection}`);
    const items = Array.isArray(res) ? res : res?.records || [];
    return items.map((item) => this.flattenRecord(item)) as T[];
  }

  async create<T = any>(collection: string, payload: Record<string, any>): Promise<T> {
    const res = await this.request<any>(`/data/${collection}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return this.flattenRecord(res) as T;
  }

  async update<T = any>(collection: string, id: string, updates: Record<string, any>): Promise<T> {
    const res = await this.request<any>(`/data/${collection}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return this.flattenRecord(res) as T;
  }

  async remove(collection: string, id: string): Promise<{ deleted: boolean; id: string }> {
    return this.request(`/data/${collection}/${id}`, {
      method: 'DELETE',
    });
  }
}
