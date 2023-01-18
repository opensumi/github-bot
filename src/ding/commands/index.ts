export * from './types';

import { CommandCenter } from '@/commander';

import { registerCommonCommand } from './common';
import { registerGitHubCommand } from './github';
import { registerOpenSumiCommand } from './opensumi';
import { DingCommandCenter } from './types';

export const cc = new CommandCenter([''], (v) => {
  registerCommonCommand(v);
  registerGitHubCommand(v);
  registerOpenSumiCommand(v);
}) as DingCommandCenter;
