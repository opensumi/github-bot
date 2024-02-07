import type { EmitterWebhookEvent } from '@octokit/webhooks/dist-types/types';

export interface IGitHubEventQueueMessage {
  /**
   * current bot id
   */
  botId: string;

  type: 'github-app' | 'github-webhook';

  data: EmitterWebhookEvent;
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
