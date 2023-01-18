export * from './types';

import { CommandCenter } from '@/commander';

import { registerCommonCommand } from './common';
import { registerGitHubCommand } from './github';
import { registerOpenSumiCommand } from './opensumi';
import { DingCommandCenter } from './types';

export const cc = new CommandCenter([''], (it) => {
  registerCommonCommand(it);
  registerGitHubCommand(it);
  registerOpenSumiCommand(it);
}) as DingCommandCenter;
