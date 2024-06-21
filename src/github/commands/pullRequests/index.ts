import {
  ActionsRepo,
  getActionsUrl,
  kBackportKeyword,
} from '@/constants/opensumi';
import { removeCommandPrefix, StopError } from '@opensumi/bot-commander';

import {
  CommandContext,
  GitHubCommandCenter,
  IssueCommentEvent,
} from '../types';

export function extractTargetBranchNameFromCommand(str: string) {
  const text = removeCommandPrefix(str, kBackportKeyword);

  // /backport to v2.23
  const match = text.match(/^to (\S+)/);
  if (match && match.length > 1) {
    return match[1];
  }
  // /backport v2.23
  const match2 = text.match(/^(\S+)/);
  if (match2 && match2.length > 1) {
    return match2[1];
  }
  return;
}

const backportAllowedRepo = new Set<string>(['opensumi/core']);
const updateLockfileAllowedRepo = new Set<string>(['opensumi/core']);

const nextAllowedRepo = new Set<string>([
  'opensumi/core',
  'opensumi/codeblitz',
]);

function constraintRepo(fullname: string, allowedRepo: Set<string>) {
  if (!allowedRepo.has(fullname)) {
    throw new StopError('This command is not allowed in this repository');
  }
}

async function checkIsPullRequestAndUserHasPermission(ctx: CommandContext) {
  const { app, payload } = ctx;
  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const { issue } = payload;

  const pull_request = issue.pull_request;
  if (!pull_request) {
    // only handle pull request
    return;
  }

  const user = payload.sender.login;
  const userHaveWritePerm = await app.octoService.checkRepoWritePermission(
    owner,
    repo,
    user,
  );

  if (!userHaveWritePerm) {
    await app.createReactionForIssueComment(ctx, 'confused');
    throw new StopError(
      `User ${user} does not have write permission to the repository`,
    );
  }
}

export function registerPullRequestCommand(it: GitHubCommandCenter) {
  // backport to v2.23
  it.on(
    kBackportKeyword,
    async (ctx, _command) => {
      const { app, payload } = ctx;
      const { issue } = payload;
      constraintRepo(payload.repository.full_name, backportAllowedRepo);
      await checkIsPullRequestAndUserHasPermission(ctx);

      const result = await app.octoService.getPrByNumber(
        payload.repository.owner.login,
        payload.repository.name,
        issue.number,
      );
      if (!result) {
        await app.replyComment(
          ctx,
          'Cannot get pull request info from ' + `#${issue.number}`,
        );
        return;
      }

      if (!result.merged) {
        await app.replyComment(
          ctx,
          'Cannot backport unmerged pull request: ' + `#${issue.number}`,
        );
        return;
      }

      const { raw: text, rawWithoutPrefix } = _command;
      const targetBranch = extractTargetBranchNameFromCommand(rawWithoutPrefix);

      if (!targetBranch) {
        await app.replyComment(
          ctx,
          'Cannot extract the target branch from ' +
            text +
            '\n\n' +
            'Example: `backport to v2.23`',
        );
        return;
      }

      await app.opensumiOctoService.backportPr({
        pull_number: issue.number,
        target_branch: targetBranch,
      });

      await app.replyComment(
        ctx,
        `Backporting to \`${targetBranch}\` branch is started.  
Please see: <${getActionsUrl(ActionsRepo.BACKPORT_PR_WORKFLOW)}>`,
      );
    },
    undefined,
  );

  it.on('next', async (ctx) => {
    const { app, payload } = ctx;
    const owner = payload.repository.owner.login;
    const repo = payload.repository.name;
    const fullname = payload.repository.full_name;
    constraintRepo(fullname, nextAllowedRepo);

    const user = payload.sender.login;
    let userHaveWritePerm = await app.octoService.checkRepoWritePermission(
      owner,
      repo,
      user,
    );
    if (!userHaveWritePerm) {
      if (
        app.ctx.setting.userWhoCanRelease &&
        app.ctx.setting.userWhoCanRelease.includes(user)
      ) {
        userHaveWritePerm = true;
      }
    }

    if (!userHaveWritePerm) {
      await app.createReactionForIssueComment(ctx, 'confused');
      return;
    }

    const { issue } = payload;
    const pull_request = issue.pull_request;
    if (!pull_request) {
      // only handle pull request
      return;
    }

    const result = await app.octoService.getPrByNumber(
      owner,
      repo,
      issue.number,
    );
    if (!result) {
      await app.replyComment(
        ctx,
        'Cannot get pull request info from ' + `#${issue.number}`,
      );
      return;
    }

    await app.opensumiOctoService.prNextRelease({
      pull_number: issue.number,
      fullname,
    });
    await app.createReactionForIssueComment(ctx, 'eyes');
  });

  it.on('update-lock', async (ctx) => {
    const { app, payload } = ctx;
    const { issue } = payload;
    const fullname = payload.repository.full_name;
    constraintRepo(fullname, updateLockfileAllowedRepo);
    await checkIsPullRequestAndUserHasPermission(ctx);

    await app.opensumiOctoService.updateLockfileForPr({
      pull_number: issue.number,
    });
    await app.createReactionForIssueComment(ctx, 'rocket');
  });
  it.on('create-merge-commit', async (ctx) => {
    const { app, payload } = ctx;
    const { issue } = payload;
    const fullname = payload.repository.full_name;
    constraintRepo(fullname, updateLockfileAllowedRepo);
    await checkIsPullRequestAndUserHasPermission(ctx);

    await app.opensumiOctoService.createMergeCommitForPr({
      pull_number: issue.number,
    });
    await app.createReactionForIssueComment(ctx, 'rocket');
  });
}
