export interface IGitHubMessageBody {
  id: string;
  name: string;
  payload: any;
}

export interface IGitHubEventQueueMessage {
  /**
   * current bot id
   */
  botId: string;

  type: 'github-app' | 'github-webhook';

  data: IGitHubMessageBody;
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
