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
  handleCommitComment,
  handleReviewComment,
  handleDiscussionComment,
} from '.';

import { EmitterWebhookEventName } from '@octokit/webhooks/dist-types/types';
import { TemplateMapping } from '@/github/types';

export const templates = {
  'issues.opened': handleIssue,
  'issues.closed': handleIssue,
  'issues.reopened': handleIssue,
  'pull_request.opened': handlePr,
  'pull_request.reopened': handlePr,
  'pull_request.closed': handlePr,
  'pull_request.ready_for_review': handlePr,
  'discussion.created': handleDiscussion,
  'discussion_comment.created': handleDiscussionComment,
  'issue_comment.created': handleIssueComment,
  'commit_comment.created': handleCommitComment,
  'release.released': handleRelease,
  'release.prereleased': handleRelease,
  'pull_request_review.submitted': handleReview,
  'pull_request_review.dismissed': handleReview,
  'pull_request_review_comment.created': handleReviewComment,
} as TemplateMapping;

export const supportTemplates = Object.keys(
  templates,
) as EmitterWebhookEventName[];
