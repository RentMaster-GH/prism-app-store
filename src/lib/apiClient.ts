export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface UserProfile {
  id: string;
  app_id: string;
  email: string;
  role: string;
  metadata: Record<string, any>;
}

export class CustomBackendClient {
  private baseUrl: string;
  private appId: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenStorageKey: string;
  private refreshStorageKey: string;

  constructor(baseUrl: string, appId: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.appId = appId;
    this.tokenStorageKey = `custom_backend_access_${appId}`;
    this.refreshStorageKey = `custom_backend_refresh_${appId}`;

    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem(this.tokenStorageKey);
      this.refreshToken = localStorage.getItem(this.refreshStorageKey);
    }
  }

  private saveTokens(accessToken: string, refreshToken?: string) {
    this.accessToken = accessToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenStorageKey, accessToken);
      if (refreshToken) {
        this.refreshToken = refreshToken;
        localStorage.setItem(this.refreshStorageKey, refreshToken);
      }
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenStorageKey);
      localStorage.removeItem(this.refreshStorageKey);
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private getDeviceCredentials(): { email: string; password: string } {
    let uid = 'anon_device';
    if (typeof window !== 'undefined') {
      uid =
        localStorage.getItem('prism_user_uid') ||
        localStorage.getItem(`device_uid_${this.appId}`) ||
        '';
      if (!uid) {
        uid = `PRISM-UID-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
        localStorage.setItem('prism_user_uid', uid);
      }
    }
    const cleanUid = uid.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    return {
      email: `device_${cleanUid}@${this.appId}.local`,
      password: `DevicePass_${uid}_Secure2026!`,
    };
  }

  private async ensureDeviceSession(): Promise<void> {
    if (this.accessToken) return;
    const { email, password } = this.getDeviceCredentials();

    try {
      const loginRes = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId: this.appId, email, password }),
      });

      if (loginRes.ok) {
        const data = await loginRes.json();
        const token = data.accessToken || data.token || data.access_token;
        if (token) {
          this.saveTokens(token, data.refreshToken || data.refresh_token);
          return;
        }
      }

      const regRes = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: this.appId,
          email,
          password,
          metadata: { source: 'auto_device_session' },
        }),
      });

      if (regRes.ok) {
        const regData = await regRes.json();
        const regToken = regData.accessToken || regData.token || regData.access_token;
        if (regToken) {
          this.saveTokens(regToken, regData.refreshToken || regData.refresh_token);
          return;
        }

        const secondLoginRes = await fetch(`${this.baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appId: this.appId, email, password }),
        });

        if (secondLoginRes.ok) {
          const secondData = await secondLoginRes.json();
          const secondToken =
            secondData.accessToken || secondData.token || secondData.access_token;
          if (secondToken) {
            this.saveTokens(
              secondToken,
              secondData.refreshToken || secondData.refresh_token
            );
          }
        }
      }
    } catch {
      // Ignore network errors here; main request will report properly
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;
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
      const data = await res.json();
      const token = data.accessToken || data.token || data.access_token;
      if (token) {
        this.saveTokens(token, data.refreshToken || data.refresh_token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    requiresAuth = false,
    retryOn401 = true
  ): Promise<T> {
    if (requiresAuth && !this.accessToken) {
      await this.ensureDeviceSession();
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && retryOn401) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.request<T>(path, options, requiresAuth, false);
      }
      if (requiresAuth) {
        this.clearTokens();
        await this.ensureDeviceSession();
        if (this.accessToken) {
          return this.request<T>(path, options, requiresAuth, false);
        }
      }
    }

    const text = await response.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      throw new Error(data?.error || data?.message || `HTTP ${response.status}`);
    }

    return data as T;
  }

  async register(email: string, password: string, metadata: Record<string, any> = {}) {
    const res = await this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ appId: this.appId, email, password, metadata }),
    });
    const token = res?.accessToken || res?.token || res?.access_token;
    if (token) {
      this.saveTokens(token, res.refreshToken || res.refresh_token);
    }
    return res;
  }

  async login(email: string, password: string) {
    const res = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ appId: this.appId, email, password }),
    });
    const token = res?.accessToken || res?.token || res?.access_token;
    if (token) {
      this.saveTokens(token, res.refreshToken || res.refresh_token);
    }
    return res;
  }

  async logout() {
    try {
      if (this.refreshToken) {
        await this.request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
      }
    } finally {
      this.clearTokens();
    }
  }

  async getMe() {
    return this.request<{ message: string; payload: any }>('/me', { method: 'GET' }, true);
  }

  async list<T = any>(collection: string): Promise<T[]> {
    const res = await this.request<{ records: T[] } | T[]>(
      `/data/${encodeURIComponent(this.appId)}/${encodeURIComponent(collection)}`,
      { method: 'GET' },
      false
    );
    if (Array.isArray(res)) return res;
    return res?.records || [];
  }

  async create<T = any>(collection: string, payload: Record<string, any>): Promise<T> {
    const res = await this.request<{ record: T } | T>(
      `/data/${encodeURIComponent(this.appId)}/${encodeURIComponent(collection)}`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      true
    );
    return (res as any)?.record ?? (res as T);
  }

  async update<T = any>(
    collection: string,
    id: string,
    payload: Record<string, any>
  ): Promise<T> {
    const res = await this.request<{ record: T } | T>(
      `/data/${encodeURIComponent(this.appId)}/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      true
    );
    return (res as any)?.record ?? (res as T);
  }

  async remove(collection: string, id: string): Promise<void> {
    await this.request(
      `/data/${encodeURIComponent(this.appId)}/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`,
      { method: 'DELETE' },
      true
    );
  }
}
