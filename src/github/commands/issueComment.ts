import { CommandCenter } from '@/commander';
import { Octokit } from '@octokit/core';
import { ExtractPayload } from '@/github/types';

type IssueCommentHandler = (
  octokit: Octokit,
  payload: ExtractPayload<'issue_comment'>,
) => Promise<void>;

export const issueCc = new CommandCenter<IssueCommentHandler>();

issueCc.on('hello', async (octokit, payload) => {
  const { issue, repository } = payload;

  await octokit.request(
    'POST /repos/{owner}/{repo}/issues/{issue_number}/comments',
    {
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: 'Hello there 👋',
    },
  );
});

export const handleCommentCommand = async ({
  octokit,
  payload,
}: {
  octokit: Octokit;
  payload: ExtractPayload<'issue_comment'>;
}) => {
  const { comment } = payload;

  const result = await issueCc.resolve(comment.body);
  if (result) {
    const { handler } = result;
    await handler(octokit, payload);
  }
};
