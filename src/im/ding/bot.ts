import { Context } from 'hono';

import Environment from '@/env';
import { App, initApp } from '@/github/app';
import { DingKVManager, DingUserKVManager } from '@/kv/ding';
import { GitHubKVManager } from '@/kv/github';
import { IDingBotSetting } from '@/kv/types';
import {
  DingBotAdapter as BaseDingBotAdapter,
  Session,
} from '@opensumi/dingtalk-bot';
import { Message } from '@opensumi/dingtalk-bot/lib/types';

import { registerCommonCommand } from '../commands/common';
import { registerGitHubCommand } from '../commands/github';
import { registerOpenSumiCommand } from '../commands/opensumi';
import { CommandCenterContext } from '../commands/types';

export class DingBotAdapter extends BaseDingBotAdapter<CommandCenterContext> {
  userInfoKVManager: DingUserKVManager;

  constructor(
    public id: string,
    public c: Context<THonoEnvironment>,
    public kvManager: DingKVManager,
    public ctx: ExecutionContext,
    public setting: IDingBotSetting,
  ) {
    super(id, {
      prefix: [''],
    });

    registerCommonCommand(this.cc);
    registerGitHubCommand(this.cc);
    registerOpenSumiCommand(this.cc);

    this.userInfoKVManager = new DingUserKVManager();
  }
  override async handle(session: Session): Promise<void> {
    super.handle(session, {
      timeout: Environment.instance().timeout,
    });
  }

  override async constructContext(
    session: Session,
  ): Promise<CommandCenterContext> {
    let app: App | undefined;
    const setting = await GitHubKVManager.instance().getAppSettingById(this.id);
    if (setting) {
      app = await initApp(setting);
    }

    return {
      bot: this,
      session,
      ctx: { message: session.msg, app },
    };
  }
}
