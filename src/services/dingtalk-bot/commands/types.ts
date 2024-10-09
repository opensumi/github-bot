import { App } from '@/services/github/app';
import { CommandCenter } from '@opensumi/bot-commander';
import { DingBotAdapter, Session } from '@opensumi/dingtalk-bot';

export interface Context {
  app?: App;
}

export type CommandCenterContext = {
  bot: DingBotAdapter;
  session: Session;
  ctx: Context;
};

export type IMCommandCenter = CommandCenter<CommandCenterContext>;
