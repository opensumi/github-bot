import { Octokit } from '@octokit/rest';
import { Repository, User } from '@octokit/webhooks-types';

import { StringBuilder } from '@/utils/string-builder';

import { ExtractPayload, Context } from '../types';

import { Name, NameBlock } from './prOrIssue';
import {
  StopHandleError,
  TemplateRenderResult,
  limitLine,
  renderPrOrIssueTitleLink,
  textTpl,
  useRef,
} from './utils';

const codecov = (text: string) => {
  return limitLine(text, 2, 1, (line) => {
    if (line.startsWith('> ')) {
      return line.slice(2);
    }
    return line;
  });
};

const formatByUserLogin = {
  'codecov-commenter': codecov,
  'codecov[bot]': codecov,
  CLAassistant: (text) => {
    const data = text.split('<br/>');
    return data.slice(1).join('<br/>');
  },
  'stale[bot]': (text) => {
    if (text.includes('marked as stale')) {
      return 'marked as stale';
    }
    return text;
  },
} as {
  [key: string]: (text: string) => string;
};

export function renderCommentBody(comment: {
  body: string;
  user: { login: string };
}) {
  let text = comment.body;
  const formatter = formatByUserLogin[comment.user.login];
  if (formatter) {
    text = formatter(text);
  }

  return text;
}

function renderComment(
  name: Name,
  payload: {
    comment: {
      html_url: string;
      body: string;
      user: { login: string };
    };
    action: string;
    repository: Repository;
    sender: User;
  },
  data: {
    title: string;
    number: number;
    html_url: string;
  },
  ctx: Context,
): TemplateRenderResult {
  const comment = payload.comment;
  const location = NameBlock[name];
  const action = payload.action;

  let doNotRenderBody = false;
  if (['edited'].includes(action)) {
    doNotRenderBody = true;
  }

  const text = textTpl(
    {
      payload,
      action,
      event: `${location} comment`,
      target: renderPrOrIssueTitleLink(data),
      title: `{{sender | link:sender}} ${action} [comment](${comment.html_url}) on [${location}](${data.html_url})`,
      body: renderCommentBody(payload.comment),
      compactTitle: `{{sender | link:sender}} ${action} [comment](${data.html_url}):  \n`,
      doNotRenderBody,
    },
    ctx,
  );

  return text;
}

export async function handleIssueComment(
  payload: ExtractPayload<'issue_comment'>,
  ctx: Context,
): Promise<TemplateRenderResult> {
  const issue = payload.issue;
  const isUnderPullRequest = Boolean(issue.pull_request);
  let name: Name = 'issues';
  if (isUnderPullRequest) {
    name = 'pull_request';
  }
  return renderComment(name, payload, issue, ctx);
}

export async function handleDiscussionComment(
  payload: ExtractPayload<'discussion_comment'>,
  ctx: Context,
) {
  return renderComment('discussion', payload, payload.discussion, ctx);
}

export async function handleCommitComment(
  payload: ExtractPayload<'commit_comment'>,
  ctx: Context & {
    octokit?: Octokit;
  },
): Promise<TemplateRenderResult> {
  const repo = payload.repository;
  const comment = payload.comment;
  const commitRefInfo = `commit@${comment.commit_id.slice(0, 6)}`;

  let title = 'M: ';

  if (ctx.octokit) {
    const resp = await ctx.octokit.request(
      'GET /repos/{owner}/{repo}/commits/{ref}',
      {
        owner: repo.owner.login,
        repo: repo.name,
        ref: comment.commit_id,
      },
    );
    if (resp.data) {
      title += ` ${resp.data.commit.message}`;
    }
  }

  let restText = '';
  const splitted = title.split('\n');
  if (splitted.length > 1) {
    title = splitted[0];
    restText = splitted.slice(1).join('\n');
  }

  const builder = new StringBuilder(`> #### [${title}]({{comment.html_url}})`);

  if (restText) {
    builder.add(useRef(restText));
  }
  builder.add(`>`);
  builder.add('{{comment.body|ref}}');

  const text = textTpl(
    {
      payload,
      event: 'commit comment',
      action: 'created',
      title: `{{sender | link}} {{action}} comment on [${commitRefInfo}]({{comment.html_url}})`,
      body: builder.build(),
    },
    ctx,
  );

  return text;
}

const allowedReviewCommentAction = new Set(['created']);

export async function handleReviewComment(
  payload: ExtractPayload<'pull_request_review_comment'>,
  ctx: Context,
): Promise<TemplateRenderResult> {
  const { action } = payload;
  const comment = payload.comment;

  const pr = payload.pull_request;

  if (!allowedReviewCommentAction.has(action)) {
    throw new StopHandleError(`not support action ${action}`);
  }

  const text = textTpl(
    {
      payload,
      event: 'review comment',
      action,
      target: '{{pull_request|link}}',
      title: `{{sender | link:sender}} ${action} [review comment](${comment.html_url}) on [pull request](${pr.html_url})`,
      body: renderCommentBody(payload.comment),
      compactTitle: `{{sender | link}} ${action} [review comment](${comment.html_url}):  \n`,
    },
    ctx,
  );

  return text;
}
