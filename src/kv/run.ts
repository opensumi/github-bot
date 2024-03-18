import { KVManager, OpenSumiRunCommon } from '@/kv';

import { IOpenSumiRunCDNVersion } from './types';

export class OpenSumiRunKVManager {
  cdnVersion: KVManager<IOpenSumiRunCDNVersion>;

  constructor() {
    this.cdnVersion = KVManager.for<IOpenSumiRunCDNVersion>(
      OpenSumiRunCommon.OPENSUMI_RUN_CDN_VERSION_PREFIX,
    );
  }

  private static _instance: OpenSumiRunKVManager;
  static instance() {
    if (!this._instance) {
      this._instance = new OpenSumiRunKVManager();
    }
    return this._instance;
  }

  getCdnVersion = async () => {
    const cdnVersionData = await this.cdnVersion.getJSON('');
    return cdnVersionData?.version || '0.0.1';
  };
}
