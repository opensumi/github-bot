import { BACKPORT_PR_WORKFLOW, getActionsUrl } from '@/constants/opensumi';

import { GitHubCommandCenter } from '../types';

function extractTargetBranchNameFromCommand(comment: string) {
  // Q: write a regex to match `backport to v2.23`
  const match = comment.match(/^backport to (\S+)/);
  return match && match.length > 1 ? match[1] : null;
}

export function registerPullRequestCommand(it: GitHubCommandCenter) {
  // backport to v2.23
  it.on('backport', async (ctx) => {
    const { app, payload } = ctx;

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
        payload,
        'Cannot get pull request info from ' + `#${issue.number}`,
      );
      return;
    }

    const { text } = ctx;
    const { command } = ctx.result;
    const targetBranch = extractTargetBranchNameFromCommand(command);

    if (!targetBranch) {
      await app.replyComment(
        payload,
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
      payload,
      `Backporting to \`${targetBranch}\` branch is started.  
Please see: <${getActionsUrl(BACKPORT_PR_WORKFLOW)}>`,
    );
  });
}
