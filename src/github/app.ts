import { Octokit } from '@octokit/rest';

import { PrivilegeEvent } from '@/constants';
import { VERSION_SYNC_KEYWORD } from '@/constants/opensumi';
import { AppSetting } from '@/github/storage';
import { App as OctoApp } from '@/lib/app.js/src';

import { issueCc } from './commands';
import { parseCommandInMarkdownComments } from './commands/parse';
import Configuration from './configuration';
import { setupWebhooksTemplate } from './handler';
import { OctoService } from './service';
import { OpenSumiOctoService } from './service/opensumi';
import { sendToDing } from './utils';

export class App {
  ctx: {
    setting: AppSetting;
  };
  octoService: OctoService;
  opensumiOctoService: OpenSumiOctoService;
  octoApp: OctoApp<{ Octokit: typeof Octokit }>;

  handleSyncVersion = async (data: string) => {
    const [tag, version] = data.split(' | ');
    await this.opensumiOctoService.syncVersion(version);
    await sendToDing(
      {
        title: 'Start Sync Version',
        text: `${tag} completed. [Start sync packages@${version} to npmmirror](https://github.com/opensumi/actions/actions/workflows/sync.yml)`,
      },
      PrivilegeEvent,
      this.ctx.setting,
    );
  };

  handleCommentCommand = async ({
    payload,
  }: {
    payload: {
      comment: {
        url: string;
        html_url: string;
        /**
         * The text of the comment.
         */
        body: string;
      };
    };
  }) => {
    const { comment } = payload;

    const result = await issueCc.resolve(comment.body);
    if (result && result.handler) {
      const { handler } = result;
      await handler(this, payload);
    }

    // 开始处理第一行注释中隐含的命令 <!-- versionInfo: RC | 2.20.5-rc-1665562305.0 -->
    const commands = parseCommandInMarkdownComments(comment.body);
    if (commands) {
      if (commands[VERSION_SYNC_KEYWORD]) {
        await this.handleSyncVersion(commands[VERSION_SYNC_KEYWORD]);
      }
    }
  };

  constructor(private setting: AppSetting) {
    const { appSettings, githubSecret } = setting;
    Configuration.fromSettings(setting);

    this.octoApp = new OctoApp({
      appId: appSettings.appId,
      privateKey: appSettings.privateKey,
      webhooks: {
        secret: githubSecret,
      },
      Octokit: Octokit,
    });
    this.ctx = {
      setting,
    };
    setupWebhooksTemplate(this.octoApp.webhooks, this.ctx);
    this.octoService = new OctoService();
    this.opensumiOctoService = new OpenSumiOctoService();
    this.octoApp.webhooks.on('star.created', async ({ payload }) => {
      const repository = payload.repository;
      const starCount = repository.stargazers_count;
      if (starCount % 100 === 0) {
        await sendToDing(
          {
            title: '⭐⭐⭐',
            text: `一个好消息，[${repository.full_name}](${repository.html_url}) 有 ${starCount} 颗 🌟 了~`,
          },
          'star.created',
          this.ctx.setting,
        );
      }
    });

    this.octoApp.webhooks.on(
      'issue_comment.created',
      this.handleCommentCommand,
    );
    this.octoApp.webhooks.on(
      'commit_comment.created',
      this.handleCommentCommand,
    );
  }

  get webhooks() {
    return this.octoApp.webhooks;
  }

  async getOcto(): Promise<Octokit> {
    for await (const data of this.octoApp.eachInstallation.iterator()) {
      return data.octokit;
    }
    throw new Error('no app installation found');
  }

  async init() {
    const octo = await this.getOcto();
    this.octoService.setOcto(octo);
    this.opensumiOctoService.setOcto(octo);
  }
}

export async function initApp(setting: AppSetting) {
  const app = new App(setting);
  await app.init();
  return app;
}
