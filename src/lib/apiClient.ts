export class CustomBackendClient {
  private baseUrl: string;
  private appId: string;

  constructor(baseUrl: string, appId: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.appId = appId;
  }

  private get accessKey(): string {
    return `cb_${this.appId}_access`;
  }

  private get refreshKey(): string {
    return `cb_${this.appId}_refresh`;
  }

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.accessKey);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.refreshKey);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.accessKey, accessToken);
    localStorage.setItem(this.refreshKey, refreshToken);
  }

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.accessKey);
    localStorage.removeItem(this.refreshKey);
  }

  private async request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    const token = this.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401 && retry && this.getRefreshToken()) {
      const refreshed = await this.refresh();
      if (refreshed) {
        return this.request<T>(path, options, false);
      }
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data as T;
  }

  async register(email: string, password: string, customClaims: Record<string, unknown> = {}) {
    const data = await this.request<{
      user: any;
      access_token: string;
      refresh_token: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        app_id: this.appId,
        email,
        password,
        custom_claims: customClaims,
      }),
    });

    this.setTokens(data.access_token, data.refresh_token);
    return data.user;
  }

  async login(email: string, password: string) {
    const data = await this.request<{
      access_token: string;
      refresh_token: string;
      payload: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        app_id: this.appId,
        email,
        password,
      }),
    });

    this.setTokens(data.access_token, data.refresh_token);
    return data;
  }

  async refresh(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) {
        this.clearTokens();
        return false;
      }

      const data = await res.json();
      this.setTokens(data.access_token, data.refresh_token);
      return true;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }).catch(() => {});
    }
    this.clearTokens();
  }

  async getMe() {
    return this.request<{ message: string; payload: any }>('/me');
  }

  async list<T = any>(collection: string) {
    const res = await this.request<{ items: Array<{ id: string; data: T; user_id: string | null; created_at: string; updated_at: string }> }>(
      `/data/${encodeURIComponent(this.appId)}/${encodeURIComponent(collection)}`
    );
    return res.items;
  }

  async create<T = any>(collection: string, payload: T) {
    const res = await this.request<{ item: { id: string; data: T; user_id: string | null; created_at: string; updated_at: string } }>(
      `/data/${encodeURIComponent(this.appId)}/${encodeURIComponent(collection)}`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return res.item;
  }

  async update<T = any>(collection: string, id: string, payload: Partial<T>) {
    const res = await this.request<{ item: { id: string; data: T; user_id: string | null; created_at: string; updated_at: string } }>(
      `/data/${encodeURIComponent(this.appId)}/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );
    return res.item;
  }

  async remove(collection: string, id: string) {
    return this.request<{ message: string }>(
      `/data/${encodeURIComponent(this.appId)}/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
      }
    );
  }
}
