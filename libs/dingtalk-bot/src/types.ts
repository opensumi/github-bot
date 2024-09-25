import type { RobotTextMessage } from 'dingtalk-stream';

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

export interface Message extends RobotTextMessage {
  conversationType: ConversationType | string;
}

export interface PrivateMessage extends Message {
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

export interface At {
  at: {
    atDingtalkIds: string[];
  };
}

export type Base<T extends string, O> = Record<T, O> & { msgtype: T };

export type Image = Base<
  'image',
  {
    picURL: string;
  }
>;

export type Markdown = Base<
  'markdown',
  {
    title: string;
    text: string;
  }
>;

export type Text = Base<
  'text',
  {
    content: string;
  }
>;

export type Link = Base<
  'link',
  {
    title: string;
    text: string;
    messageUrl: string;
    picUrl: string;
  }
>;

export type SingleActionCard = Base<
  'actionCard',
  {
    /**
     * 首屏会话透出的展示内容。
     */
    title: string;
    /**
     * markdown格式的消息。
     */
    text: string;

    singleTitle: string;
    singleURL: string;
  }
>;

export type MultiActionCard = Base<
  'actionCard',
  {
    /**
     * 首屏会话透出的展示内容。
     */
    title: string;
    /**
     * markdown格式的消息。
     */
    text: string;
    btns: {
      title: string;
      actionURL: string;
    }[];
    /**
     * 0：按钮竖直排列
     * 1：按钮横向排列
     */
    btnOrientation?: '0' | '1';
  }
>;

export type SendMessage =
  | Image
  | Markdown
  | Text
  | Link
  | SingleActionCard
  | MultiActionCard;

export function atDingtalkIds(...atDingtalkIds: string[]): At {
  return {
    at: {
      atDingtalkIds,
    },
  };
}

export function text(content: string): Text {
  return {
    msgtype: 'text',
    text: {
      content: content ? content.toString().trim() : '',
    },
  };
}

export function compose(...objects: any[]) {
  return Object.assign({}, ...objects);
}

export function markdown(title: string, text: string): Markdown {
  return {
    msgtype: 'markdown',
    markdown: {
      title,
      text,
    },
  };
}

export function image(url: string): Image {
  return {
    msgtype: 'image',
    image: { picURL: url },
  };
}

export function extension(extension: Record<string, unknown>) {
  return {
    msgtype: 'extension',
    extension,
  };
}

export function code(language: string, code: string) {
  return {
    ...extension({ text_type: 'code_snippet', code_language: language }),
    ...text(code),
  };
}
