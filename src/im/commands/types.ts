import { App } from '@/github/app';
import { CommandCenter } from '@opensumi/bot-commander';
import { Message } from '@opensumi/dingtalk-bot/lib/types';

import { IBotAdapter } from '../types';

export interface Context {
  message: Message;
  app?: App;
}

export type CommandCenterContext = {
  bot: IBotAdapter;
  ctx: Context;
};

export type IMCommandCenter = CommandCenter<CommandCenterContext>;
