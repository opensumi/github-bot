export * from './types';

import { CommandCenter } from '@opensumi/bot-commander';

import { registerCommonCommand } from './common';
import { registerGitHubCommand } from './github';
import { registerOpenSumiCommand } from './opensumi';
import { IMCommandCenter } from './types';

export const cc = new CommandCenter({
  prefix: [''],
}) as IMCommandCenter;

registerCommonCommand(cc);
registerGitHubCommand(cc);
registerOpenSumiCommand(cc);
