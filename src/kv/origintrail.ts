import { KVManager } from '@/kv';

export class OriginTrialTokenKVManager {
  token: KVManager<string>;

  constructor() {
    this.token = KVManager.for<string>(OriginTrailToken.TOKEN_PREFIX);
  }

  private static _instance: OriginTrialTokenKVManager;
  static instance() {
    if (!this._instance) {
      this._instance = new OriginTrialTokenKVManager();
    }
    return this._instance;
  }

  getToken = async () => {
    return await this.token.get('');
  };
}
