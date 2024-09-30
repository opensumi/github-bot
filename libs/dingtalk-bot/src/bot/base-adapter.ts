import { Message, SendMessage } from '../types';

export interface IBotAdapter {
  id: string;
  msg: Message;

  replyText(text: string, contentExtra?: Record<string, any>): Promise<void>;
  reply(content: SendMessage): Promise<void>;

  handle(): Promise<void>;
}
