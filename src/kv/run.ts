import { KVManager, OpenSumiRunCommon } from '@/kv';

import { IOpenSumiRunConfig, IOpenSumiRunOriginalTrialToken } from './types';

export class OpenSumiRunKVManager {
  cdnConfig: KVManager<IOpenSumiRunConfig>;

  originalTrialToken: KVManager<IOpenSumiRunOriginalTrialToken>;

  constructor() {
    this.cdnConfig = KVManager.for<IOpenSumiRunConfig>(
      OpenSumiRunCommon.OPENSUMI_RUN_CDN_INFO_PREFIX,
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

  getCdnConfig = async () => {
    const cdnVersionData = await this.cdnConfig.getJSON('');
    return (
      cdnVersionData || {
        version: '0.0.1',
        cdnBase: 'https://g.alicdn.com/opensumi/run',
      }
    );
  };

  getTrialToken = async (env: 'local' | 'prod' | 'unittest') => {
    const trialTokenData = await this.originalTrialToken.getJSON('');
    return trialTokenData ? trialTokenData[env] : undefined;
  };
}
