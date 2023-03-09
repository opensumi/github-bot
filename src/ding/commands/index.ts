export * from './types';

import { CommandCenter } from '@/commander';

import { registerCommonCommand } from './common';
import { registerGitHubCommand } from './github';
import { registerOpenSumiCommand } from './opensumi';
import { DingCommandCenter } from './types';

export const cc = new CommandCenter(['']) as DingCommandCenter;

registerCommonCommand(cc);
registerGitHubCommand(cc);
registerOpenSumiCommand(cc);

if (IF_DEF_CHATGPT) {
  require('./chatgpt').registerChatGPTCommand(cc);
}
