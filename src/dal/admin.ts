import { Common } from './constants';
import { KVItem } from './kv';
import { IAdminInfo } from './types';

export class AdminDAO {
  kvItem: KVItem<IAdminInfo>;

  private constructor() {
    this.kvItem = KVItem.for(Common.ADMIN);
  }

  private static _instance: AdminDAO;
  static instance() {
    if (!this._instance) {
      this._instance = new AdminDAO();
    }
    return this._instance;
  }

  async getAdminToken() {
    const data = await this.kvItem.get();
    return data?.token;
  }

  async setAdminToken(token: string) {
    await this.kvItem.update({
      token,
    });
  }

  async getTokenByScope(scope: string) {
    const data = await this.kvItem.get();
    if (!data) return;
    if (data.tokenByScope) {
      return data.tokenByScope[scope];
    }
  }

  async setScopeToken(scope: string, token: string) {
    await this.kvItem.update({
      tokenByScope: {
        [scope]: token,
      },
    });
  }
}
