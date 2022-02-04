export interface TextMessage {
  content: string;
}

export interface AtUsersItem {
  dingtalkId: string;
  staffId?: string;
}

export enum ConversationType {
  private = '1',
  group = '2',
}

export interface Message {
  msgtype: string;
  text: TextMessage;
  msgId: string;
  createAt: number;
  conversationType: ConversationType;
  conversationId: string;
  senderId: string;
  senderNick: string;
  senderCorpId?: string;
  sessionWebhook: string;
  sessionWebhookExpiredTime: number;
  isAdmin: boolean;
}

export interface PrivateMessage extends Message {
  chatbotCorpId: string;
  senderStaffId?: string;
  conversationType: ConversationType.private;
}

export interface GroupMessage extends Message {
  atUsers: AtUsersItem[];
  conversationType: ConversationType.group;
  conversationTitle: string;
  isInAtList: boolean;
}

export function isPrivateMessage(message: any): message is PrivateMessage {
  return (
    message &&
    message.conversationType &&
    message.conversationType === ConversationType.private
  );
}

export function isGroupMessage(message: any): message is GroupMessage {
  return (
    message &&
    message.conversationType &&
    message.conversationType === ConversationType.group
  );
}
