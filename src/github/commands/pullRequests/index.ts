import { GitHubCommandCenter } from '../types';

function extractTargetBranchNameFromCommand(comment: string) {
  // Q: write a regex to match `backport to v2.23`
  const match = comment.match(/^backport to (\S+)/);
  return match && match.length > 1 ? match[1] : null;
}

export function registerPullRequestCommand(it: GitHubCommandCenter) {
  it.on('backport', async (app, ctx, payload) => {
    const { issue } = payload;
    const pull_request = issue.pull_request;
    if (!pull_request) {
      // only handle pull request
      return;
    }
    // Q: how to get the target branch info(such as) from the payload? payload is IssueCommentEvent?
    // A: https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#issue_comment

    const { command } = ctx;
    const targetBranch = extractTargetBranchNameFromCommand(command);

    if (!targetBranch) {
      await app.replyComment(
        payload,
        'Cannot find the target branch from ' + command,
      );
      return;
    }

    const result = await app.octoService.getPrByNumber(
      payload.repository.owner.login,
      payload.repository.name,
      issue.number,
    );
    if (!result) {
      return;
    }
  });
}
