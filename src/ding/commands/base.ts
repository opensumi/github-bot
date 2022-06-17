import { CommandCenter } from '@/command';
import type { DingBot } from '../bot';
import { Message } from '../types';
import { IApp } from '@/github/app';
import mri from 'mri';

export interface Context<T = any> {
  message: Message;
  command: string;
  parsed: mri.Argv<T>;
  app: IApp;
}

export type Handler = (bot: DingBot, ctx: Context) => Promise<void>;

export const cc = new CommandCenter<Handler>(['']);
