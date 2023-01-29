import { CommandCenter, IArgv } from '@/commander';
import { IRegexResolveResult, IResolveResult } from '@/commander/types';
import { App } from '@/github/app';

import type { DingBot } from '../bot';
import { Message } from '../types';

export interface Context<T = any> {
  message: Message;
  command: string;
  /**
   * _ 的首位为命令
   */
  parsed: IArgv<T>;
  app?: App;
  result: IResolveResult;
}

export interface RegexContext<T = any> extends Context<T> {
  result: IRegexResolveResult;
}

export type ContextWithApp<T = any> = Required<Context<T>>;

export type Handler = (bot: DingBot, ctx: Context) => Promise<void>;
export type RegexHandler = (bot: DingBot, ctx: RegexContext) => Promise<void>;

export type DingCommandCenter = CommandCenter<Handler | RegexHandler>;
