// 在 github app 的设置页面中查看
// 如：https://github.com/organizations/riril/settings/apps/ririltestbot

let appId = '';
let webhookSecret = '';
let privateKey = '';

let dingtalkWebhookUrl = '';
let dingtalkSecret = '';

let ghWebhookSecret = '';

try {
  appId = GH_APP_ID;
  webhookSecret = GH_APP_WEBHOOK_SECRET;
  privateKey = GH_APP_PRIVATE_KEY;

  dingtalkWebhookUrl = DINGTALK_WEBHOOK_URL;
  dingtalkSecret = DINGTALK_SECRET;

  ghWebhookSecret = GH_WEBHOOK_SECRET;
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

export const getSettingById = async (id: string) => {
  const webhooks = await WEBHOOKS_INFO.get<Setting>(id, 'json');
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

export const getDefaultSetting = (): Setting => {
  return {
    githubSecret: ghWebhookSecret,
    dingWebhooks: [
      {
        url: dingtalkWebhookUrl,
        secret: dingtalkSecret,
      },
    ],
    contentLimit: 300,
  };
};

export default {
  appId,
  webhookSecret,
  privateKey,
};
