import { App } from '@/github/app';
import { CommandCenter, IArgv } from '@opensumi/bot-commander';

import { IBotAdapter, Message } from '../types';

export interface Context<T = any> {
  message: Message;
  /**
   * _ 的首位为命令
   */
  parsed: IArgv<T>;
  app?: App;
}

export type ContextWithApp<T = any> = Required<Context<T>>;

interface IMCommandCenterContext {
  bot: IBotAdapter;
  ctx: Context;
}

export type IMCommandCenter = CommandCenter<IMCommandCenterContext>;
