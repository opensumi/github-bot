// 在 github app 的设置页面中查看
// 如：https://github.com/organizations/riril/settings/apps/ririltestbot

import { KVManager } from '@/kv';

let ghAppId = '';
let ghAppWebhookSecret = '';
let ghAppPrivateKey = '';

let dingtalkWebhookUrl = '';
let dingtalkSecret = '';

try {
  ghAppId = GH_APP_ID;
  ghAppWebhookSecret = GH_APP_WEBHOOK_SECRET;
  ghAppPrivateKey = GH_APP_PRIVATE_KEY;

  dingtalkWebhookUrl = DINGTALK_WEBHOOK_URL;
  dingtalkSecret = DINGTALK_SECRET;
} catch (error) {
  console.error(error);
}

export interface DingWebhookItem {
  url: string;
  secret: string;
  // 该 webhook 仅接收哪些事件的推送
  event?: string[];
}

export interface Setting {
  /**
   * 在 GitHub 上设置的此 webhook 的验证
   */
  githubSecret: string;
  dingWebhooks: DingWebhookItem[];
  contentLimit: number;
  // 开启这个选项会只推送社区需要的那几个 event
  isCommunity?: boolean;
  // 监听哪些事件
  event?: string[];
  // 不展示 repo 名字，适合单仓库
  notDisplayRepoName?: boolean;
}

const GITHUB_SETTINGS_PREFIX = 'github/settings/';
const GITHUB_APP_SETTINGS_PREFIX = 'github/app/settings/';

export const getSettingById = async (id: string) => {
  const webhooks = await WEBHOOKS_INFO.get<Setting>(
    GITHUB_SETTINGS_PREFIX + id,
    'json',
  );
  if (webhooks) {
    if (webhooks.contentLimit === undefined) {
      webhooks.contentLimit = 300;
    }
    if (webhooks.isCommunity === undefined) {
      webhooks.isCommunity = true;
    }
    if (webhooks.notDisplayRepoName === undefined) {
      webhooks.notDisplayRepoName = true;
    }
  }

  return webhooks;
};

export type AppSetting = Setting & {
  appSettings: {
    appId: string;
    privateKey: string;
  };
};

export const getAppSettingById = (id: string) => {
  const manager = new KVManager<AppSetting>(GITHUB_APP_SETTINGS_PREFIX, id);
  return manager.getJSON();
};

export const getDefaultAppSetting = (): AppSetting => {
  return {
    appSettings: {
      appId: ghAppId,
      privateKey: ghAppPrivateKey,
    },
    githubSecret: ghAppWebhookSecret,
    dingWebhooks: [
      {
        url: dingtalkWebhookUrl,
        secret: dingtalkSecret,
      },
    ],
    contentLimit: 300,
  };
};
