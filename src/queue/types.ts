import { IGitHubEvent } from '@/github';

export interface IGitHubEventQueueMessage {
  /**
   * current bot id
   */
  botId: string;

  type: 'github-app' | 'github-webhook';

  data: IGitHubEvent;
}

export interface IWechatyQueueMessage {
  /**
   * current bot id
   */
  botId: string;

  type: 'wechaty';
  data: any;
}

export type TQueueMessage = IGitHubEventQueueMessage | IWechatyQueueMessage;
