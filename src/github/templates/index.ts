export * from './prOrIssue';
export * from './comment';
export * from './release';
export * from './review';
export * from './utils';
export * from './workflow';

import pick from 'lodash/pick';

import { TemplateMapping, Context } from '@/github/types';

import {
  handlePr,
  handleIssue,
  handleReview,
  handleRelease,
  handleDiscussion,
  handleWorkflowRun,
  handleIssueComment,
  handleCommitComment,
  handleReviewComment,
  handleDiscussionComment,
} from '.';

const templateMapping = Object.freeze({
  'issues.opened': handleIssue,
  'pull_request.opened': handlePr,
  'discussion.created': handleDiscussion,
  'release.released': handleRelease,
  'issues.closed': handleIssue,
  'issues.reopened': handleIssue,
  'pull_request.reopened': handlePr,
  'pull_request.closed': handlePr,
  'pull_request.edited': handlePr,
  'pull_request.ready_for_review': handlePr,
  'discussion_comment.created': handleDiscussionComment,
  'issue_comment.created': handleIssueComment,
  'commit_comment.created': handleCommitComment,
  'pull_request_review.submitted': handleReview,
  'pull_request_review.dismissed': handleReview,
  'pull_request_review_comment.created': handleReviewComment,
  'workflow_run.completed': handleWorkflowRun,
}) as TemplateMapping;

export const getTemplates = (ctx: Context) => {
  let templates = templateMapping;

  if (ctx.setting.isCommunity) {
    templates = pick(templateMapping, [
      'issues.opened',
      'pull_request.opened',
      'discussion.created',
      'release.released',
    ]) as TemplateMapping;
  }

  if (ctx.setting.event) {
    const newTpl = {} as any;
    for (const k of ctx.setting.event) {
      const h = templateMapping[k];
      if (h) {
        newTpl[k] = h;
      }
    }
    templates = newTpl;
  }

  return templates;
};
