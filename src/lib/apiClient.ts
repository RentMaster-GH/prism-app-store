export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class CustomBackendClient {
  private baseUrl: string;
  private appId: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseUrl: string, appId: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.appId = appId;

    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem(`${this.appId}_access_token`);
      this.refreshToken = localStorage.getItem(`${this.appId}_refresh_token`);
    }
  }

  private saveTokens(tokens: AuthTokens) {
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

  private getDeviceCredentials(): { email: string; password: string } {
    if (typeof window === 'undefined') {
      return { email: `server_${this.appId}@device.local`, password: `DevPass_${this.appId}_2026!` };
    }

    const emailKey = `${this.appId}_device_email`;
    const passKey = `${this.appId}_device_password`;

    let email = localStorage.getItem(emailKey);
    let password = localStorage.getItem(passKey);

    if (!email || !password) {
      let uid = localStorage.getItem('prism_user_uid') || localStorage.getItem(`${this.appId}_uid`);
      if (!uid) {
        uid = `dev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem('prism_user_uid', uid);
      }
      const cleanUid = uid.toLowerCase().replace(/[^a-z0-9]/g, '');
      email = `${cleanUid}@${this.appId}.local`;
      password = `DeviceAuth_${cleanUid}_${this.appId}!`;
      localStorage.setItem(emailKey, email);
      localStorage.setItem(passKey, password);
    }

    return { email, password };
  }

  private async ensureDeviceSession(): Promise<void> {
    if (this.accessToken) return;

    const { email, password } = this.getDeviceCredentials();

    try {
      const loginRes = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: this.appId, email, password }),
      });

      if (loginRes.ok) {
        const data = await loginRes.json();
        const accessToken = data?.accessToken || data?.token || data?.access_token;
        const refreshToken = data?.refreshToken || data?.refresh_token || '';
        if (accessToken) {
          this.saveTokens({ accessToken, refreshToken });
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
        }),
      });

      if (regRes.ok) {
        const regData = await regRes.json();
        const accessToken = regData?.accessToken || regData?.token || regData?.access_token;
        const refreshToken = regData?.refreshToken || regData?.refresh_token || '';
        if (accessToken) {
          this.saveTokens({ accessToken, refreshToken });
          return;
        }
      }

      const retryLogin = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: this.appId, email, password }),
      });

      if (retryLogin.ok) {
        const retryData = await retryLogin.json();
        const accessToken = retryData?.accessToken || retryData?.token || retryData?.access_token;
        const refreshToken = retryData?.refreshToken || retryData?.refresh_token || '';
        if (accessToken) {
          this.saveTokens({ accessToken, refreshToken });
        }
      }
    } catch {
      // Allow request to proceed and surface standard network error if offline
    }
  }

  private normalizeRecord(item: any): any {
    if (!item || typeof item !== 'object') return item;
    const nested = item.data && typeof item.data === 'object' && !Array.isArray(item.data) ? item.data : {};
    return {
      ...nested,
      ...item,
      id: item.id ?? nested.id,
      created_at: item.created_at ?? nested.created_at,
      updated_at: item.updated_at ?? nested.updated_at,
    };
  }

  private async request(path: string, options: RequestInit = {}, retry = true): Promise<any> {
    if (!this.accessToken) {
      await this.ensureDeviceSession();
    }

    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }
    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    const res = await fetch(`${this.baseUrl}${path}`, { ...options, headers });

    if (res.status === 401 && retry) {
      if (this.refreshToken) {
        const refreshed = await this.attemptRefresh();
        if (refreshed) {
          return this.request(path, options, false);
        }
      }
      this.clearTokens();
      await this.ensureDeviceSession();
      if (this.accessToken) {
        return this.request(path, options, false);
      }
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data;
  }

  private async attemptRefresh(): Promise<boolean> {
    try {
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
      this.saveTokens(tokens);
      return true;
    } catch {
      this.clearTokens();
      return false;
    }
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
    if (data.accessToken) {
      this.saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken || '' });
    }
    return data;
  }

  async login(email: string, password: string) {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: this.appId, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    this.saveTokens(data);
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

  async list(collection: string): Promise<any[]> {
    try {
      const headers: Record<string, string> = {};
      if (this.accessToken) headers['Authorization'] = `Bearer ${this.accessToken}`;
      const endpoint = collection === 'apps' ? '/data/public-apps' : `/data/${collection}`;
      const directRes = await fetch(`${this.baseUrl}${endpoint}`, { headers });
      if (directRes.ok) {
        const directData = await directRes.json();
        const rawList = Array.isArray(directData) ? directData : directData?.records || directData?.data || [];
        if (rawList.length > 0) return rawList.map((item: any) => this.normalizeRecord(item));
      }
    } catch {}
    const result = await this.request(`/data/${collection}`);
    const rawList = Array.isArray(result) ? result : result?.records || result?.data || [];
    return rawList.map((item: any) => this.normalizeRecord(item));
  }

  async create(collection: string, payload: Record<string, any>) {
    const result = await this.request(`/data/${collection}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const record = result?.record || result?.data && result?.id ? result : result?.data || result;
    return this.normalizeRecord(record);
  }

  async update(collection: string, id: string, updates: Record<string, any>) {
    const result = await this.request(`/data/${collection}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    const record = result?.record || result?.data && result?.id ? result : result?.data || result;
    return this.normalizeRecord(record);
  }

  async remove(collection: string, id: string) {
    return this.request(`/data/${collection}/${id}`, {
      method: 'DELETE',
    });
  }

  async trackInstall(id: string): Promise<number | null> {
    try {
      const res = await fetch(`${this.baseUrl}/api/data/public/install/${this.appId}/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      return typeof data.install_count === "number" ? data.install_count : null;
    } catch {
      return null;
    }
  }
}
