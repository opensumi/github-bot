import type { EmitterWebhookEventName as _EmitterWebhookEventName } from '@octokit/webhooks/dist-types/types';

/**
 * @format selectize
 */
export type EmitterWebhookEventName = `${_EmitterWebhookEventName}`;

export interface IDingWebhookItem {
  /**
   * Webhook url
   */
  url: string;
  /**
   * You should select **signed mode(加签模式)** in the security settings of the bot. and you will see the secret.
   */
  secret: string;
  /**
   * 哪些事件需要推送到这个 webhook，如：`release.released`。
   * 不填写则推送所有事件
   */
  event?: EmitterWebhookEventName[];
  /**
   * 备注。你可以在这个空里备注下这个 webhook 是属于哪个群的。
   * @format textarea
   */
  remark?: string;
}

export interface ISetting {
  /**
   * 此 webhook 的 secret. 你要在 GitHub 的 webhook 设置里面设置这个 secret
   */
  githubSecret: string;
  /**
   * 需要推送通知的钉钉机器人的 webhook 地址
   */
  dingWebhooks: IDingWebhookItem[];
  /**
   * 通知的内容长度限制，超过这个长度的内容会被截断, -1 表示不截断（但消息仍受各平台能发送的最大字符影响，钉钉为 5k 字符）
   */
  contentLimit: number;
  /**
   * 只推送社区需要的那几个 event： [ 'issues.opened', 'pull_request.opened', 'discussion.created', 'release.released' ]
   *
   * 代码见：https://github.com/opensumi/github-bot/blob/main/src/github/templates/index.ts#L25
   * @default false
   */
  isCommunity?: boolean;
  /**
   * 要将哪些事件发送到钉钉群中。注意：设置了当前字段，isCommunity 就会失效
   */
  event?: EmitterWebhookEventName[];
  /**
   * 通知 workflow 的成功、失败事件
   * 键是仓库的名字，值是某个 workflow 的名字(yml 中配置的 name 字段)
   * 比如说：`{ 'opensumi/actions': ['sync to npmmirror'] }`
   */
  workflowEventToNotify?: Record<string, string[]>;
  /**
   * 不在消息中展示 repo 名字，适合单仓库
   * @default false
   */
  notDisplayRepoName?: boolean;
}

export interface IInstallationSetting {
  /**
   * 键是 flag，值是 installation id
   */
  flags: Record<string, number>;
}

export type AppSetting = ISetting & {
  /**
   * GitHub App related
   */
  appSettings: {
    /**
     * The appId of your GitHub App.
     */
    appId: string;
    /**
     * Generate a private key in GitHub App Settings.
     * @format textarea
     */
    privateKey: string;
  };

  /**
   * github id of the user who can release
   */
  userWhoCanRelease?: string[];
  /**
   * 提供了一个接口，可以通过 flag 置换 GitHub 的 installation token
   */
  installation?: IInstallationSetting;
};

export interface IDingBotSetting {
  outGoingToken: string;
}

export interface IDingInfo {
  defaultRepo?: string;
  enableConversation?: boolean;
}

export interface IDingUserInfo {
  githubId: string;
}

export type SettingType =
  | 'app-settings'
  | 'ding-info'
  | 'ding-setting'
  | 'setting';

export const SettingsNameMap = {
  'app-settings': 'GitHub App 配置',
  'ding-info': '钉钉群信息配置',
  'ding-setting': '钉钉机器人配置',
  setting: 'GitHub Webhooks 配置',
};

export enum EValidLevel {
  None = 1,
  Normal = 1 << 1,
  Admin = 1 << 2,
}

export const LevelSettingsMap = {
  [EValidLevel.None]: [],
  [EValidLevel.Normal]: ['setting', 'app-settings'],
  [EValidLevel.Admin]: ['app-settings', 'ding-info', 'ding-setting', 'setting'],
} as Record<EValidLevel, SettingType[]>;

export interface IAdminInfo {
  token: string;
  /**
   * 各 webhook 配置项的 token
   */
  tokenByScope?: Record<string, string>;
}

export interface IOpenSumiRunConfig {
  version: string;
  cdnBase: string;
}

export interface IOpenSumiRunOriginalTrialToken {
  local: string;
  prod: string;
  unittest: string;
}

export interface IGitHubOauthAppConfig {
  clientId: string;
  clientSecret: string;
}
