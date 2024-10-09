import { Common } from './constants';
import { KVItem } from './kv';
import { EValidLevel, IAdminInfo } from './types';

export class CommonKVManager {
  kvItem: KVItem<IAdminInfo>;

  constructor() {
    this.kvItem = KVItem.for(Common.ADMIN);
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
    const data = await this.kvItem.get();
    return data?.token;
  }
  private async getTokenByScope(scope: string) {
    const data = await this.kvItem.get();
    if (!data) return;
    if (data.tokenByScope) {
      return data.tokenByScope[scope];
    }
  }

  async setScopeToken(scope: string, token: string) {
    const data = await this.kvItem.get();
    if (!data) return;
    if (!data.tokenByScope) {
      data.tokenByScope = {};
    }
    data.tokenByScope[scope] = token;
    await this.kvItem.set(data);
  }
}
