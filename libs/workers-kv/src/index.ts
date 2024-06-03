import { getAuthHeaders } from './utils';

export class WorkersKV {
  headers: Record<string, string>;
  constructor(
    private accountId: string,
    private cfAuthToken: string,
    private namespaceId: string,
  ) {
    this.headers = getAuthHeaders(undefined, undefined, cfAuthToken);
  }

  getUrl(key: string, searchParams?: Record<string, string>) {
    const encoded = encodeURIComponent(key);
    let url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/storage/kv/namespaces/${this.namespaceId}/values/${encoded}`;

    if (searchParams) {
      const search = new URLSearchParams(searchParams);
      url += `?${search.toString()}`;
    }
    return url;
  }

  put = async (
    key: string,
    value: any,
    options?: {
      expiration?: any;
      expiration_ttl?: any;
    },
  ) => {
    const url = this.getUrl(key, options);

    return await fetch(url, {
      headers: this.headers,
      method: 'PUT',
      body: value,
    });
  };

  async get(key: string) {
    const url = this.getUrl(key);
    return await fetch(url, {
      headers: this.headers,
    });
  }

  async delete(key: string) {
    const url = this.getUrl(key);
    return await fetch(url, {
      method: 'DELETE',
      headers: this.headers,
    });
  }
}
