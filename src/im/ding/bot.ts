import { Context } from 'hono';

import Environment from '@/env';
import { App, initApp } from '@/github/app';
import { DingKVManager, DingUserKVManager } from '@/kv/ding';
import { GitHubKVManager } from '@/kv/github';
import { IDingBotSetting } from '@/kv/types';
import { DingBotAdapter as BaseDingBotAdapter } from '@opensumi/dingtalk-bot';
import { Message } from '@opensumi/dingtalk-bot/lib/types';

import { registerCommonCommand } from '../commands/common';
import { registerGitHubCommand } from '../commands/github';
import { registerOpenSumiCommand } from '../commands/opensumi';
import { CommandCenterContext } from '../commands/types';

export class DingBotAdapter extends BaseDingBotAdapter<CommandCenterContext> {
  githubKVManager: GitHubKVManager;
  userInfoKVManager: DingUserKVManager;

  constructor(
    public id: string,
    public c: Context<THonoEnvironment>,
    public msg: Message,
    public kvManager: DingKVManager,
    public ctx: ExecutionContext,
    public setting: IDingBotSetting,
  ) {
    super(id, msg, {
      prefix: [''],
    });

    registerCommonCommand(this.cc);
    registerGitHubCommand(this.cc);
    registerOpenSumiCommand(this.cc);

    this.githubKVManager = GitHubKVManager.instance();
    this.userInfoKVManager = new DingUserKVManager();
  }

  override async handle(): Promise<void> {
    super.handle({
      timeout: Environment.instance().timeout,
    });
  }

  override async getContext(): Promise<CommandCenterContext> {
    let app: App | undefined;
    const setting = await this.githubKVManager.getAppSettingById(this.id);
    if (setting) {
      app = await initApp(setting);
    }

    return {
      bot: this,
      ctx: { message: this.msg, app },
    };
  }
}
