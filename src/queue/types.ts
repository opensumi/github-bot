export interface IGitHubEventQueueMessage {
  /**
   * current bot id
   */
  botId: string;

  type: 'github-app';

  data: {
    id: string;
    event: string;
    payload: any;
  };
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
