import { App } from '@/services/github/app';
import { CommandCenter } from '@opensumi/bot-commander';
import { Session } from '@opensumi/dingtalk-bot';
import { Message } from '@opensumi/dingtalk-bot/lib/types';

import { IBotAdapter } from '../types';

export interface Context {
  app?: App;
}

export type CommandCenterContext = {
  bot: IBotAdapter;
  session: Session;
  ctx: Context;
};

export type IMCommandCenter = CommandCenter<CommandCenterContext>;
