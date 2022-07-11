import { CommandCenter } from '@/command';
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

export const handleComment = async ({
  octokit,
  payload,
}: {
  octokit: Octokit;
  payload: ExtractPayload<'issue_comment'>;
}) => {
  const { comment } = payload;

  const handler = await issueCc.resolve(comment.body);
  await handler?.(octokit, payload);
};
