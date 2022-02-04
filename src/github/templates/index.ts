export * from './prOrIssue';
export * from './comment';
export * from './release';
export * from './review';
export * from './utils';

import {
  handlePr,
  handleIssue,
  handleReview,
  handleRelease,
  handleDiscussion,
  handleIssueComment,
  handleDiscussionComment,
} from '.';

import { EmitterWebhookEventName } from '@octokit/webhooks/dist-types/types';
import { TemplateMapping } from '@/github/types';

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
  'issue_comment.created': handleIssueComment,
  'issue_comment.deleted': handleIssueComment,
  'release.published': handleRelease,
  'release.released': handleRelease,
  'pull_request_review.submitted': handleReview,
  'pull_request_review.edited': handleReview,
  'pull_request_review.dismissed': handleReview,
} as TemplateMapping;

export const supportTemplates = Object.keys(
  templates,
) as EmitterWebhookEventName[];
