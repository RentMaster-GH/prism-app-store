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
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.appId = appId;

    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem(`${this.appId}_access_token`);
      this.refreshToken = localStorage.getItem(`${this.appId}_refresh_token`);
    }
  }

  private saveTokens(accessToken: string, refreshToken?: string) {
    this.accessToken = accessToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${this.appId}_access_token`, accessToken);
      if (refreshToken) {
        localStorage.setItem(`${this.appId}_refresh_token`, refreshToken);
      }
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${this.appId}_access_token`);
      localStorage.removeItem(`${this.appId}_refresh_token`);
    }
  }

  private getDeviceCredentials() {
    if (typeof window === 'undefined') {
      return { email: 'server@prism.local', password: 'PrismServerDevice2026!' };
    }

    let email = localStorage.getItem(`${this.appId}_device_email`);
    let password = localStorage.getItem(`${this.appId}_device_password`);

    if (!email || !password) {
      const uid =
        localStorage.getItem('prism_user_uid') ||
        `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem('prism_user_uid', uid);
      const cleanUid = uid.toLowerCase().replace(/[^a-z0-9]/g, '');
      email = `device_${cleanUid}@${this.appId}.local`;
      password = `PrismDevice_${cleanUid}_2026!`;
      localStorage.setItem(`${this.appId}_device_email`, email);
      localStorage.setItem(`${this.appId}_device_password`, password);
    }

    return { email, password };
  }

  private async ensureDeviceSession(): Promise<boolean> {
    if (this.accessToken) return true;

    const { email, password } = this.getDeviceCredentials();

    try {
      const loginRes = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: this.appId, email, password }),
      });

      if (loginRes.ok) {
        const data = await loginRes.json();
        const token = data?.accessToken || data?.token || data?.access_token;
        if (token) {
          this.saveTokens(token, data?.refreshToken || data?.refresh_token);
          return true;
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
        const token = regData?.accessToken || regData?.token || regData?.access_token;
        if (token) {
          this.saveTokens(token, regData?.refreshToken || regData?.refresh_token);
          return true;
        }
      }

      if (regRes.status === 409) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`${this.appId}_device_email`);
          localStorage.removeItem(`${this.appId}_device_password`);
        }
        return await this.ensureDeviceSession();
      }
    } catch (err) {
      console.error('Device session error:', err);
    }

    return false;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;
    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      const token = data?.accessToken || data?.token || data?.access_token;
      if (token) {
        this.saveTokens(token, data?.refreshToken || data?.refresh_token);
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }

  private async request(path: string, options: RequestInit = {}, retry = true): Promise<any> {
    if (!this.accessToken) {
      await this.ensureDeviceSession();
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401 && retry) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        this.clearTokens();
        await this.ensureDeviceSession();
      }
      return this.request(path, options, false);
    }

    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const errMsg = data?.error || data?.message || `Request failed with status ${res.status}`;
      throw new Error(errMsg);
    }

    return data;
  }

  async register(email: string, password: string, custom_claims: Record<string, any> = {}) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ app_id: this.appId, email, password, custom_claims }),
    }, false);
    const token = data?.accessToken || data?.token || data?.access_token;
    if (token) {
      this.saveTokens(token, data?.refreshToken || data?.refresh_token);
    }
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ app_id: this.appId, email, password }),
    }, false);
    const token = data?.accessToken || data?.token || data?.access_token;
    if (token) {
      this.saveTokens(token, data?.refreshToken || data?.refresh_token);
    }
    return data;
  }

  async logout() {
    if (this.refreshToken) {
      try {
        await fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
      } catch {
        // ignore network errors on logout
      }
    }
    this.clearTokens();
  }

  async me() {
    return this.request('/me', { method: 'GET' });
  }

  async list(collection: string) {
    const res = await this.request(`/data/${collection}`, { method: 'GET' });
    const rows = Array.isArray(res) ? res : res?.records || res?.data || [];
    return rows.map((row: any) => ({
      ...(row.data || {}),
      id: row.id,
      owner_id: row.owner_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  }

  async create(collection: string, payload: Record<string, any>) {
    const row = await this.request(`/data/${collection}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      ...(row?.data || payload),
      id: row?.id,
      owner_id: row?.owner_id,
      created_at: row?.created_at,
      updated_at: row?.updated_at,
    };
  }

  async update(collection: string, id: string, updates: Record<string, any>) {
    const row = await this.request(`/data/${collection}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return {
      ...(row?.data || updates),
      id: row?.id || id,
      owner_id: row?.owner_id,
      created_at: row?.created_at,
      updated_at: row?.updated_at,
    };
  }

  async remove(collection: string, id: string) {
    return this.request(`/data/${collection}/${id}`, {
      method: 'DELETE',
    });
  }
}
