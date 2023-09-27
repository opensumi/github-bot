import { KVManager, Common } from '@/kv';

import { EValidLevel, IAdminInfo } from './types';

export class CommonKVManager {
  kv: KVManager<IAdminInfo>;

  constructor() {
    this.kv = KVManager.for(Common.ADMIN_PREFIX);
  }

  async isTokenValidFor(token?: string, scope?: string): Promise<EValidLevel> {
    if (!token) return EValidLevel.None;
    if (scope) {
      const tokenByScope = await this.getTokenByScope(scope);
      if (tokenByScope && tokenByScope === token) return EValidLevel.Normal;
    }
    const adminToken = await this.getAdminToken();
    if (adminToken && adminToken === token) return EValidLevel.Admin;
    return EValidLevel.None;
  }

  private async getAdminToken() {
    const data = await this.kv.getJSON('');
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
