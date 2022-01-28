import { WebhookEventName, WebhookEventMap } from '@octokit/webhooks-types';
import { EmitterWebhookEventName } from '@octokit/webhooks/dist-types/types';

import {
  issuesReopened,
  issuesClosed,
  issuesEdited,
  issuesOpened,
} from './templates/issues';

export type ExtractPayload<TEmitterEvent extends EmitterWebhookEventName> =
  TEmitterEvent extends `${infer TWebhookEvent}.${infer _TAction}`
    ? WebhookEventMap[Extract<TWebhookEvent, WebhookEventName>]
    : WebhookEventMap[Extract<TEmitterEvent, WebhookEventName>];

export type TemplateMapping = {
  [TEmitterEvent in EmitterWebhookEventName]?: (
    payload: ExtractPayload<TEmitterEvent>,
  ) => {
    title: string;
    text: string;
  };
};

export const templates = {
  'issues.opened': issuesOpened,
  'issues.closed': issuesClosed,
  'issues.reopened': issuesReopened,
  'issues.edited': issuesEdited,
} as TemplateMapping;
