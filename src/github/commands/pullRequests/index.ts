import {
  ActionsRepo,
  getActionsUrl,
  kBackportKeyword,
} from '@/constants/opensumi';
import { StopError } from '@opensumi/bot-commander';
import { removeCommandPrefix } from '@opensumi/bot-commander/lib/utils';

import { GitHubCommandCenter } from '../types';

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

const allowedRepo = new Set<string>(['opensumi/core', 'opensumi/codeblitz']);

function constraintRepo(fullname: string, allowedRepo: Set<string>) {
  if (!allowedRepo.has(fullname)) {
    throw new StopError('This command is not allowed in this repository');
  }
}

export function registerPullRequestCommand(it: GitHubCommandCenter) {
  // backport to v2.23
  it.on(
    kBackportKeyword,
    async (ctx) => {
      const { app, payload } = ctx;
      constraintRepo(payload.repository.full_name, backportAllowedRepo);

      const { issue } = payload;

      const pull_request = issue.pull_request;
      if (!pull_request) {
        // only handle pull request
        return;
      }

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

      const { text } = ctx;
      const { command } = ctx.result;
      const targetBranch = extractTargetBranchNameFromCommand(command);

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
    constraintRepo(fullname, allowedRepo);

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
      await app.replyComment(
        ctx,
        `You don't have permission to release version on \`${owner}/${repo}\`.`,
      );
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
}
