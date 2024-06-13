import { Octokit } from '@octokit/rest';
import { Repository, User } from '@octokit/webhooks-types';

import {
  StringBuilder,
  getFirstLineAndRest,
  limitLine,
} from '@/utils/string-builder';

import { ExtractPayload, Context } from '../types';

import {
  TemplateRenderResult,
  IssuesTitleLink,
  Template,
  Reference,
} from './components';
import { Name, NameBlock } from './prOrIssue';

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

export function CommentBody(comment: {
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

  return Template(
    {
      payload,
      event: `${location} comment`,
      target: IssuesTitleLink(data),
      title: `{{sender | link:sender}} {{action}} [comment](${comment.html_url}) on [${location}](${data.html_url})`,
      body: CommentBody(payload.comment),
      compactTitle: `{{sender | link:sender}} {{action}} [comment](${data.html_url}):`,
      blockUsers: new Set<string>(['railway-app[bot]', 'ant-codespaces[bot]']),
      blockActions: new Set(['edited']),
    },
    ctx,
  );
}

export async function handleIssueComment(
  payload: ExtractPayload<'issue_comment'>,
  ctx: Context,
): Promise<TemplateRenderResult> {
  const issue = payload.issue;
  let name: Name = 'issues';
  if (Boolean(issue.pull_request)) {
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

  const { firstLine, rest } = getFirstLineAndRest(title);

  title = firstLine;

  const builder = new StringBuilder(`#### [${title}]({{comment.html_url}})`);

  if (rest) {
    builder.add(Reference(rest));
  }

  return Template(
    {
      payload,
      event: 'commit comment',
      action: 'created',
      title: `{{sender | link}} {{action}} comment on [${commitRefInfo}]({{comment.html_url}})`,
      target: builder.build(),
      body: '{{comment.body}}',
    },
    ctx,
  );
}

const allowedReviewCommentAction = new Set(['created']);

export async function handleReviewComment(
  payload: ExtractPayload<'pull_request_review_comment'>,
  ctx: Context,
): Promise<TemplateRenderResult> {
  const comment = payload.comment;

  return Template(
    {
      payload,
      event: 'review comment',
      target: '{{pull_request|link|h4}}',
      title: `{{sender | link:sender}} {{action}} [review comment](${comment.html_url}) on [pull request]({{pull_request.html_url}})`,
      body: CommentBody(payload.comment),
      compactTitle: `{{sender | link}} {{action}} [review comment](${comment.html_url}):`,
      allowActions: allowedReviewCommentAction,
    },
    ctx,
  );
}
