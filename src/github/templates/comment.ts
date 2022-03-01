import {
  limitLine,
  Name,
  NameBlock,
  renderPrOrIssueLink,
  renderUserLink,
  useRef,
} from '.';
import { ExtractPayload } from '@/github/types';
import { Repository, User } from '@octokit/webhooks-types';
import { Octokit } from '@octokit/core';
import { textTpl, titleTpl } from './utils';
import { Context } from '../app';
import { StringBuilder } from '@/utils';

const formatByUserLogin = {
  'codecov-commenter': (text: string) => {
    return limitLine(text, 3, 1, (line) => {
      if (line.startsWith('> ')) {
        return line.slice(2);
      }
      return line;
    });
  },
  CLAassistant: (text) => {
    const data = text.split('<br/>');
    return data.slice(1).join('<br/>');
  },
} as {
  [key: string]: (text: string) => string;
};

export function renderCommentBody(
  data: {
    title: string;
    html_url: string;
    number?: number;
  },
  comment: { body: string; user: { login: string } },
  limit = -1,
) {
  let text = comment.body;
  const formatter = formatByUserLogin[comment.user.login];
  if (formatter) {
    text = formatter(text);
  }
  const builder = new StringBuilder(`> #### ${renderPrOrIssueLink(data)}`);
  builder.add(`>`);
  builder.add(useRef(text, limit));
  return builder.build();
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
) {
  const comment = payload.comment;
  const location = NameBlock[name];
  const action = payload.action;

  let notRenderBody = false;
  if (['edited'].includes(action)) {
    notRenderBody = true;
  }

  const title = titleTpl({
    repo: payload.repository,
    event: `${location} comment`,
    action,
  });

  const text = textTpl(
    {
      repo: payload.repository,
      title: `${renderUserLink(payload.sender)} ${action} [comment](${
        comment.html_url
      }) on [${location}](${data.html_url})`,
      body: renderCommentBody(data, payload.comment, ctx.setting.contentLimit),
      notRenderBody,
    },
    ctx,
  );

  return {
    title,
    text,
  };
}

export async function handleIssueComment(
  payload: ExtractPayload<'issue_comment'>,
  ctx: Context,
) {
  const issue = payload.issue;
  const isUnderPullRequest = Boolean(issue.pull_request);
  let name = 'issues' as Name;
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
) {
  const repo = payload.repository;
  const comment = payload.comment;
  const commitId = comment.commit_id.slice(0, 6);

  let commitInfo = `commit@${commitId}`;

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
      const commit = resp.data.commit;
      commitInfo += ` ${commit.message}`;
    }
  }
  const title = titleTpl({
    repo: payload.repository,
    event: 'commit comment',
    action: 'created',
  });

  const text = textTpl(
    {
      repo,
      title: `${renderUserLink(payload.sender)} commented on [commit](${
        comment.html_url
      })`,
      body: renderCommentBody(
        {
          html_url: comment.html_url,
          title: commitInfo,
        },
        payload.comment,
        ctx.setting.contentLimit,
      ),
    },
    ctx,
  );

  return {
    title,
    text,
  };
}

export async function handleReviewComment(
  payload: ExtractPayload<'pull_request_review_comment'>,
  ctx: Context,
) {
  const repo = payload.repository;
  const comment = payload.comment;
  const pr = payload.pull_request;
  const action = 'created';
  const location = 'pull request';

  const title = titleTpl({
    repo,
    event: 'review comment',
    action,
  });

  const text = textTpl(
    {
      repo,
      title: `${renderUserLink(payload.sender)} ${action} [review comment](${
        comment.html_url
      }) on [${location}](${pr.html_url})`,
      body: renderCommentBody(pr, payload.comment, ctx.setting.contentLimit),
    },
    ctx,
  );

  return {
    title,
    text,
  };
}
