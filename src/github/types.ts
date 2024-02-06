import { EmitterWebhookEventName } from '@octokit/webhooks/dist-types/types';
import { WebhookEventName, WebhookEventMap } from '@octokit/webhooks-types';

import { ISetting } from '@/kv/types';

export interface Context {
  setting: ISetting;

  /**
   * if queue mode is true
   * some event will be rendered more concise in order to avoid the message is too long
   */
  queueMode?: boolean;
}

export type ExtractPayload<TEmitterEvent extends EmitterWebhookEventName> =
  TEmitterEvent extends `${infer TWebhookEvent}.${infer _TAction}`
    ? WebhookEventMap[Extract<TWebhookEvent, WebhookEventName>]
    : WebhookEventMap[Extract<TEmitterEvent, WebhookEventName>];

export type MarkdownContent = {
  title: string;
  text: string;
};

export type TemplateRenderResult = {
  title: string;
  text: string;
  detail?: {
    bodyText: string;
    bodyHeader: string;
  };
};

export type THasAction = {
  action?: string;
};

export interface IHasSender {
  sender: {
    login: string;
  };
}

export interface ChangeItem {
  from: string;
}

export interface Changes {
  body?: ChangeItem;
  title?: ChangeItem;
  base?: {
    ref: ChangeItem;
    sha: ChangeItem;
  };
}

export interface THasChanges {
  changes?: Changes;
}
