import { ECompletionModel } from '../openai/shared';

export interface IConversationSetting {
  preferredModel?: ECompletionModel;
  apiReverseProxyUrl?: string;
}

export const enum EMessageRole {
  Human = '人类',
  AI = 'AI',
}

export interface IConversationHistoryItem {
  type: EMessageRole;
  str: string;
}

export interface IConversationData {
  data: IConversationHistoryItem[];
}
