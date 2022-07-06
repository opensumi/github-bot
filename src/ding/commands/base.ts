import { CommandCenter } from '@/command';
import type { DingBot } from '../bot';
import { Message } from '../types';
import { IApp } from '@/github/app';
import mri from 'mri';

export interface Context<T = any> {
  message: Message;
  command: string;
  /**
   * _ 的首位为命令
   */
  parsed: mri.Argv<T>;
  app?: IApp;
}

export type ContextWithApp<T = any> = Required<Context<T>>;

export type Handler = (bot: DingBot, ctx: Context) => Promise<void>;

export const cc = new CommandCenter<Handler>(['']);
