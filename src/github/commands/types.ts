import { Octokit } from '@octokit/rest';

import { ExtractPayload } from '@/github/types';
import { CommandCenter } from '@opensumi/bot-commander';

import type { App } from '../app';

export type IssueCommentHandler = () => Promise<void>;

export type IssueCommentEvent = ExtractPayload<'issue_comment'>;

export interface CommandContext {
  app: App;
  payload: IssueCommentEvent;
  id: string;
  name: string;
  octokit: Octokit;
}

export type GitHubCommandCenter = CommandCenter<CommandContext>;
