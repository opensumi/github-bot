import { WebhookEventName, WebhookEventMap } from '@octokit/webhooks-types';
import { EmitterWebhookEventName } from '@octokit/webhooks/dist-types/types';

import { ISetting } from './storage';
export interface Context {
  setting: ISetting;
}

export type ExtractPayload<TEmitterEvent extends EmitterWebhookEventName> =
  TEmitterEvent extends `${infer TWebhookEvent}.${infer _TAction}`
    ? WebhookEventMap[Extract<TWebhookEvent, WebhookEventName>]
    : WebhookEventMap[Extract<TEmitterEvent, WebhookEventName>];

export type MarkdownContent = {
  title: string;
  text: string;
};

export type TemplateMapping = {
  [TEmitterEvent in EmitterWebhookEventName]?: (
    payload: ExtractPayload<TEmitterEvent>,
    ctx: Context,
  ) => Promise<MarkdownContent>;
};

export type THasAction = {
  action?: string;
};

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
