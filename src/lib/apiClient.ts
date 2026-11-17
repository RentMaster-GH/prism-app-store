export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class CustomBackendClient {
  private baseUrl: string;
  private appId: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private authPromise: Promise<void> | null = null;

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

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${this.appId}_access_token`);
      localStorage.removeItem(`${this.appId}_refresh_token`);
    }
  }

  private getDeviceCredentials(): { email: string; password: string } {
    if (typeof window === 'undefined') {
      return { email: 'server@prism.local', password: 'PrismDeviceKey#2026!' };
    }
    const emailKey = `${this.appId}_device_email`;
    const passKey = `${this.appId}_device_password`;

    let email = localStorage.getItem(emailKey);
    let password = localStorage.getItem(passKey);

    if (!email || !password) {
      const uid =
        localStorage.getItem('prism_user_uid') ||
        `dev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const cleanUid = uid.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      email = `${cleanUid}@device.prism.local`;
      password = `Prism_${cleanUid}_Secret#2026!`;
      localStorage.setItem(emailKey, email);
      localStorage.setItem(passKey, password);
    }

    return { email, password };
  }

  async ensureDeviceSession(forceNew = false): Promise<void> {
    if (this.accessToken && !forceNew) return;
    if (this.authPromise) return this.authPromise;

    this.authPromise = (async () => {
      try {
        if (forceNew) {
          this.clearTokens();
          if (typeof window !== 'undefined') {
            localStorage.removeItem(`${this.appId}_device_email`);
            localStorage.removeItem(`${this.appId}_device_password`);
          }
        }

        const { email, password } = this.getDeviceCredentials();

        const loginRes = await fetch(`${this.baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ app_id: this.appId, email, password }),
        });

        if (loginRes.ok) {
          const data = await loginRes.json();
          if (data?.accessToken && data?.refreshToken) {
            this.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
            return;
          }
        }

        const regRes = await fetch(`${this.baseUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ app_id: this.appId, email, password }),
        });

        if (regRes.ok) {
          const regData = await regRes.json();
          if (regData?.accessToken && regData?.refreshToken) {
            this.setTokens({ accessToken: regData.accessToken, refreshToken: regData.refreshToken });
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
          if (retryData?.accessToken && retryData?.refreshToken) {
            this.setTokens({ accessToken: retryData.accessToken, refreshToken: retryData.refreshToken });
          }
        }
      } finally {
        this.authPromise = null;
      }
    })();

    return this.authPromise;
  }

  async register(email: string, password: string, role = 'user', customClaims: Record<string, any> = {}) {
    const res = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: this.appId,
        email,
        password,
        role,
        custom_claims: customClaims,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    if (data?.accessToken && data?.refreshToken) {
      this.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
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
    this.setTokens(data);
    return data;
  }

  async refreshSession(): Promise<boolean> {
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
    const tokens = await res.json();
    this.setTokens(tokens);
    return true;
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

  async request<T = any>(path: string, options: RequestInit = {}, requiresAuth = false): Promise<T> {
    if (requiresAuth && !this.accessToken) {
      await this.ensureDeviceSession();
    }

    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }
    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    let res = await fetch(`${this.baseUrl}${path}`, { ...options, headers });

    if (res.status === 401 && requiresAuth) {
      const refreshed = await this.refreshSession();
      if (!refreshed) {
        await this.ensureDeviceSession(true);
      }
      if (this.accessToken) {
        headers.set('Authorization', `Bearer ${this.accessToken}`);
        res = await fetch(`${this.baseUrl}${path}`, { ...options, headers });
      }
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data as T;
  }

  getMe() {
    return this.request('/me', { method: 'GET' }, true);
  }

  list<T = any>(collection: string): Promise<T[]> {
    return this.request(`/data/${this.appId}/${collection}`, { method: 'GET' }, false);
  }

  create<T = any>(collection: string, payload: Record<string, any>): Promise<T> {
    return this.request(
      `/data/${this.appId}/${collection}`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      true
    );
  }

  update<T = any>(collection: string, id: string, payload: Record<string, any>): Promise<T> {
    return this.request(
      `/data/${this.appId}/${collection}/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      true
    );
  }

  remove(collection: string, id: string): Promise<{ message: string; id: string }> {
    return this.request(`/data/${this.appId}/${collection}/${id}`, { method: 'DELETE' }, true);
  }
}
