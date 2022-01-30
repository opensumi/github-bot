import { WebhookEventName, WebhookEventMap } from '@octokit/webhooks-types';
import { EmitterWebhookEventName } from '@octokit/webhooks/dist-types/types';

import {
  handlePr,
  handleIssue,
  handleDiscussion,
  handleIssueComment,
  handleDiscussionComment,
} from './templates';

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
  'issues.opened': handleIssue,
  'issues.closed': handleIssue,
  'issues.reopened': handleIssue,
  'issues.edited': handleIssue,
  'pull_request.opened': handlePr,
  'pull_request.reopened': handlePr,
  'pull_request.closed': handlePr,
  'pull_request.edited': handlePr,
  'pull_request.ready_for_review': handlePr,
  'discussion.created': handleDiscussion,
  'discussion.edited': handleDiscussion,
  'discussion.deleted': handleDiscussion,
  'discussion_comment.created': handleDiscussionComment,
  'discussion_comment.deleted': handleDiscussionComment,
  // 'discussion_comment.edited': handleDiscussionComment,
  'issue_comment.created': handleIssueComment,
  'issue_comment.deleted': handleIssueComment,
  // 'issue_comment.edited': handleIssueComment,
} as TemplateMapping;
