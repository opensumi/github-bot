import { OpenSumiRunCommon } from './constants';
import { KVManager } from './kv';

import { IOpenSumiRunConfig, IOpenSumiRunOriginalTrialToken } from './types';

export class OpenSumiRunDAO {
  cdnConfig: KVManager<IOpenSumiRunConfig>;

  originalTrialToken: KVManager<IOpenSumiRunOriginalTrialToken>;

  constructor() {
    this.cdnConfig = KVManager.for<IOpenSumiRunConfig>(
      OpenSumiRunCommon.OPENSUMI_RUN_CDN_INFO_PREFIX,
      5 * 60 * 1000,
    );

    this.originalTrialToken = KVManager.for<IOpenSumiRunOriginalTrialToken>(
      OpenSumiRunCommon.OPENSUMI_RUN_ORIGINAL_TRIAL_TOKEN_PREFIX,
      5 * 60 * 1000,
    );
  }

  private static _instance: OpenSumiRunDAO;
  static instance() {
    if (!this._instance) {
      this._instance = new OpenSumiRunDAO();
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
