import { KVManager, Common } from '@/kv';

import { IAdminInfo } from './types';

export class CommonKVManager {
  kv: KVManager<IAdminInfo>;

  constructor() {
    this.kv = KVManager.for(Common.ADMIN_PREFIX);
  }

  async isTokenValidFor(token?: string, scope?: string) {
    if (!token) return false;
    if (scope) {
      const tokenByScope = await this.getTokenByScope(scope);
      if (tokenByScope && tokenByScope === token) return true;
    }
    const adminToken = await this.getAdminToken();
    if (adminToken && adminToken === token) return true;
    return false;
  }

  private async getAdminToken() {
    const data = (await this.kv.getJSON('')) ?? { token: '1234' };
    return data?.token;
  }
  private async getTokenByScope(scope: string) {
    const data = await this.kv.getJSON('');
    if (!data) return;
    if (data.tokenByScope) {
      return data.tokenByScope[scope];
    }
  }
}
