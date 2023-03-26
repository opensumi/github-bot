import { KVManager, Common } from '@/kv';

import { IAdminInfo } from './types';

export class CommonKVManager {
  kv: KVManager<IAdminInfo>;

  constructor() {
    this.kv = KVManager.for(Common.ADMIN_PREFIX);
  }

  async getToken() {
    const data = await this.kv.getJSON('');
    return data?.token;
  }
}
