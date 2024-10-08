import { Context } from 'hono';

import { GitHubDAO } from '@/dao/github';
import { IDingBotSetting } from '@/dao/types';
import Environment from '@/env';
import { App, initApp } from '@/services/github/app';
import {
  DingBotAdapter as BaseDingBotAdapter,
  Session,
} from '@opensumi/dingtalk-bot';

import { registerCommonCommand } from './commands/common';
import { registerGitHubCommand } from './commands/github';
import { registerOpenSumiCommand } from './commands/opensumi';
import { CommandCenterContext } from './commands/types';

export class DingBotAdapter extends BaseDingBotAdapter<CommandCenterContext> {
  constructor(
    public id: string,
    public c: Context<THonoEnvironment>,
    public ctx: ExecutionContext,
    public setting: IDingBotSetting,
  ) {
    super(id, {
      prefix: [''],
      timeout: Environment.instance().timeout,
    });

    registerCommonCommand(this.cc);
    registerGitHubCommand(this.cc);
    registerOpenSumiCommand(this.cc);
  }

  protected override async constructContext(
    session: Session,
  ): Promise<CommandCenterContext> {
    let app: App | undefined;
    const setting = await GitHubDAO.instance().getAppSettingById(this.id);
    if (setting) {
      app = await initApp(setting);
    }

    return {
      bot: this as any,
      session,
      ctx: { app },
    };
  }
}
