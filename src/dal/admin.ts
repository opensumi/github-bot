import { Common } from './constants';
import { KVItem } from './kv';
import { IAdminInfo } from './types';

export class AdminDAO {
  kvItem: KVItem<IAdminInfo>;

  constructor() {
    this.kvItem = KVItem.for(Common.ADMIN);
  }

  async getAdminToken() {
    const data = await this.kvItem.get();
    return data?.token;
  }
  async getTokenByScope(scope: string) {
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
