import kyDefault from 'ky';

import { getAuthHeaders } from './utils';

const ky = kyDefault.extend({
  throwHttpErrors: false,
});

export class WorkersKV {
  headers: Record<string, string>;
  constructor(
    private accountId: string,
    private cfAuthToken: string,
    private namespaceId: string,
  ) {
    this.headers = getAuthHeaders(undefined, undefined, cfAuthToken);
  }

  getUrl(key: string) {
    const encoded = encodeURIComponent(key);
    return `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/storage/kv/namespaces/${this.namespaceId}/values/${encoded}`;
  }

  put = async (
    key: string,
    value: any,
    options?: {
      expiration?: any;
      expiration_ttl?: any;
    },
  ) => {
    const url = this.getUrl(key);

    return await ky.put(url, {
      headers: this.headers,
      searchParams: options,
      body: value,
    });
  };

  async get(key: string) {
    const url = this.getUrl(key);
    return await ky.get(url, {
      headers: this.headers,
    });
  }

  async delete(key: string) {
    const url = this.getUrl(key);
    return await ky.delete(url, {
      headers: this.headers,
    });
  }
}
