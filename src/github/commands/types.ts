import { Octokit } from '@octokit/rest';

import { ExtractPayload } from '@/github/types';
import { CommandCenter } from '@opensumi/bot-commander';

import type { App } from '../app';

export type IssueCommentHandler = () => Promise<void>;

export interface CommandContext {
  app: App;
  payload: ExtractPayload<'issue_comment'>;
  id: string;
  name: string;
  octokit: Octokit;
}

export type GitHubCommandCenter = CommandCenter<CommandContext>;
