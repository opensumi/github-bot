import { Webhooks } from '@octokit/webhooks';

import { GitHubDAO } from '@/dao/github';
import { GitHubEventWorker, IOctokitShape } from '@/queue/worker/github';

export class MockGitHubEventWorker extends GitHubEventWorker {
  async createGitHubApp(botId: string): Promise<IOctokitShape | undefined> {
    const appSetting = await GitHubDAO.instance().getAppSettingById(botId);

    const webhooks = new Webhooks<{
      secret: undefined;
    }>({
      secret: appSetting!.githubSecret,
    });

    return {
      webhooks,
      setting: appSetting!,
    };
  }
}
