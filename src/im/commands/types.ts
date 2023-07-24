import { CancellationToken } from '@opensumi/ide-utils/lib/cancellation';

import { CommandCenter, IArgv } from '@/commander';
import { IRegexResolveResult, IResolveResult } from '@/commander/types';
import { App } from '@/github/app';

import type { DingBot } from '../ding/bot';
import { Message } from '../types';

export interface Context<T = any> {
  message: Message;
  /**
   * _ 的首位为命令
   */
  parsed: IArgv<T>;
  app?: App;
}

export type ContextWithApp<T = any> = Required<Context<T>>;

interface DingCommandCenterContext {
  bot: DingBot;
  ctx: Context;
}

export type DingCommandCenter = CommandCenter<DingCommandCenterContext>;
