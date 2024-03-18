import { KVManager, OpenSumiRunCommon } from '@/kv';

import { IOpenSumiRunConfig, IOpenSumiRunOriginalTrialToken } from './types';

export class OpenSumiRunKVManager {
  cdnVersion: KVManager<IOpenSumiRunConfig>;

  originalTrialToken: KVManager<IOpenSumiRunOriginalTrialToken>;

  constructor() {
    this.cdnVersion = KVManager.for<IOpenSumiRunConfig>(
      OpenSumiRunCommon.OPENSUMI_RUN_CDN_VERSION_PREFIX,
    );

    this.originalTrialToken = KVManager.for<IOpenSumiRunOriginalTrialToken>(
      OpenSumiRunCommon.OPENSUMI_RUN_ORIGINAL_TRIAL_TOKEN_PREFIX,
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

  getTrialToken = async (env: 'local' | 'prod' | 'unittest') => {
    const trialTokenData = await this.originalTrialToken.getJSON('');
    return trialTokenData ? trialTokenData[env] : undefined;
  }
}
