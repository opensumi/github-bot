import { Octokit } from '@octokit/rest';
import { HandlerFunction } from '@octokit/webhooks/dist-types/types';

import { PrivilegeEvent } from '@/constants';
import { VERSION_SYNC_KEYWORD } from '@/constants/opensumi';
import { AppSetting } from '@/kv/types';
import { App as OctoApp } from '@/lib/app.js/src';

import { CommandContext, issueCc } from './commands';
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

  handleSyncVersion = async (data: string) => {
    const [tag, version] = data.split(' | ');
    await this.opensumiOctoService.syncVersion(version);
    await sendToDing(
      {
        title: 'Starts Synchronizing',
        text: `${tag} has published. [starts synchronizing packages@${version} to npmmirror](https://github.com/opensumi/actions/actions/workflows/sync.yml)`,
      },
      PrivilegeEvent,
      this.ctx.setting,
    );
  };

  handleCommentCommand = async ({
    payload,
    octokit,
    id,
    name,
  }: Parameters<
    HandlerFunction<
      'issue_comment.created' | 'commit_comment.created',
      {
        octokit: Octokit;
      }
    >
  >[0]) => {
    const { comment } = payload;

    await issueCc.tryHandle(comment.body, {
      app: this,
      id,
      name,
      payload,
      octokit,
    } as unknown as CommandContext);

    // 开始处理第一行注释中隐含的命令 <!-- versionInfo: RC | 2.20.5-rc-1665562305.0 -->
    const commands = parseCommandInMarkdownComments(comment.body);
    if (commands) {
      if (commands[VERSION_SYNC_KEYWORD]) {
        await this.handleSyncVersion(commands[VERSION_SYNC_KEYWORD]);
      }
    }
  };

  async replyComment(ctx: CommandContext, text: string) {
    const { payload, octokit } = ctx;
    const { issue, repository } = payload;
    return await octokit.request(
      'POST /repos/{owner}/{repo}/issues/{issue_number}/comments',
      {
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: issue.number,
        body: text,
      },
    );
  }
  get webhooks() {
    return this.octoApp.webhooks;
  }

  async createInstallationAccessToken(id: number) {
    return this.octoApp.octokit.apps
      .createInstallationAccessToken({
        installation_id: id,
      })
      .then((v) => ({
        token: v.data.token,
        expires_at: v.data.expires_at,
      }));
  }

  private async getOcto(): Promise<Octokit> {
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
  console.log('init app success');
  return app;
}
