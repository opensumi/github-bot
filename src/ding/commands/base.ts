import { CommandCenter } from '@/command';
import type { DingBot } from '../bot';
import { Message } from '../types';
import { IApp } from '@/github/app';
import mri from 'mri';

interface Context {
  message: Message;
  command: string;
  parsed: mri.Argv;
  app: IApp;
}

export type Handler = (bot: DingBot, ctx: Context) => Promise<void>;

export const cc = new CommandCenter<Handler>(['']);
