import { CommandCenter } from '@/commander';
import { ExtractPayload } from '@/github/types';

import type { App } from '../app';

export type IssueCommentHandler = (
  app: App,
  payload: ExtractPayload<'issue_comment'>,
) => Promise<void>;

export type GitHubCommandCenter = CommandCenter<IssueCommentHandler>;
