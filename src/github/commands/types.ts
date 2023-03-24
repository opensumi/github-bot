import { CommandCenter } from '@/commander';
import { ExtractPayload } from '@/github/types';

import type { App } from '../app';

export interface GitHubContext {
  /**
   * 去除了 prefix 的原始命令
   */
  command: string;
}

export type IssueCommentHandler = (
  app: App,
  ctx: GitHubContext,
  payload: ExtractPayload<'issue_comment'>,
) => Promise<void>;

export type GitHubCommandCenter = CommandCenter<IssueCommentHandler>;
