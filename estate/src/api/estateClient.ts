export interface EstateClientConfig {
  /** Admin API base path (default: /ghost/api/admin) */
  adminBase: string;
  /** Content API base path (default: /ghost/api/content) */
  contentBase: string;
  /** Ghost Content API key (required for content API) */
  contentApiKey?: string;
  /** Fetch function override (for custom headers, auth, etc.) */
  fetch?: typeof fetch;
}

const DEFAULTS: EstateClientConfig = {
  adminBase: '/ghost/api/admin',
  contentBase: '/ghost/api/content',
};

export class EstateClient {
  private config: EstateClientConfig;
  private fetcher: typeof fetch;

  constructor(config?: Partial<EstateClientConfig>) {
    this.config = { ...DEFAULTS, ...config };
    this.fetcher = this.config.fetch ?? globalThis.fetch.bind(globalThis);
  }

  /** GET from admin API */
  async adminGet<T>(path: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', `${this.config.adminBase}${path}`, params);
  }

  /** POST to admin API */
  async adminPost<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', `${this.config.adminBase}${path}`, undefined, body);
  }

  /** PUT to admin API */
  async adminPut<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('PUT', `${this.config.adminBase}${path}`, undefined, body);
  }

  /** DELETE from admin API */
  async adminDel(path: string): Promise<void> {
    await this.request('DELETE', `${this.config.adminBase}${path}`);
  }

  /** GET from content API */
  async contentGet<T>(path: string, params?: Record<string, string>): Promise<T> {
    const merged = { ...params };
    if (this.config.contentApiKey && !merged.key) {
      merged.key = this.config.contentApiKey;
    }
    return this.request<T>('GET', `${this.config.contentBase}${path}`, merged);
  }

  private async request<T>(
    method: string,
    url: string,
    params?: Record<string, string>,
    body?: unknown,
  ): Promise<T> {
    let fullUrl = url;
    if (params) {
      const qs = new URLSearchParams(params).toString();
      if (qs) fullUrl += `?${qs}`;
    }

    const headers: Record<string, string> = {};
    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await this.fetcher(fullUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });

    if (res.status === 204) {
      return undefined as T;
    }

    if (!res.ok) {
      let errBody: string | undefined;
      try {
        errBody = await res.text();
      } catch {
        // ignore parse failure
      }
      throw new EstateApiError(res.status, res.statusText, errBody);
    }

    return res.json() as Promise<T>;
  }
}

export class EstateApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body?: string,
  ) {
    super(`Estate API error: ${status} ${statusText}`);
    this.name = 'EstateApiError';
  }
}

/** Singleton client for browser-side use (configurable via configureEstateClient) */
let defaultClient = new EstateClient();

export function getEstateClient(): EstateClient {
  return defaultClient;
}

export function configureEstateClient(config: Partial<EstateClientConfig>): void {
  defaultClient = new EstateClient(config);
}
