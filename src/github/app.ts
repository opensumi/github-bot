import { App as OctoApp } from '@/lib/app.js/src';
import { Octokit } from '@octokit/rest';
import { ISetting, AppSetting, GitHubKVManager } from '@/github/storage';
import { webhookHandler, setupWebhooksTemplate } from './handler';
import { issueCc } from './commands';
import { sendToDing } from './utils';
import { error } from '@/runtime/response';
import { AppService } from './service';
import { ExtractPayload } from './types';
import { parseCommandInMarkdownComments } from './commands/parse';

export interface Context {
  setting: ISetting;
}

export interface AppContext extends Context {
  setting: AppSetting;
  service: AppService;
}

export class App {
  ctx: {
    setting: AppSetting;
  };
  service: AppService;
  octoApp: OctoApp;

  handleSyncVersion = async (data: string) => {
    const [tag, version] = data.split(' | ');
    await this.service.syncVersion(version);
    await sendToDing(
      {
        title: 'Start Sync Version',
        text: `${tag} completed
start sync packages${version} to npmmirror.
[see progress here](https://github.com/opensumi/actions/actions/workflows/sync.yml)
I will notify you when sync done.`,
      },
      'star.created',
      this.ctx.setting,
    );
  };

  handleCommentCommand = async ({
    payload,
  }: {
    payload: ExtractPayload<'issue_comment'>;
  }) => {
    const { comment } = payload;

    const result = await issueCc.resolve(comment.body);
    if (result) {
      const { handler } = result;
      await handler(this, payload);
    }

    // 开始处理第一行注释中隐含的命令 <!-- versionInfo: RC | 2.20.5-rc-1665562305.0 -->
    const commands = parseCommandInMarkdownComments(comment.body);
    if (commands) {
      if (commands['versionInfo']) {
        await this.handleSyncVersion(commands['versionInfo']);
      }
    }
  };

  constructor(private setting: AppSetting) {
    const { appSettings, githubSecret } = setting;
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
    this.service = new AppService(this, setting);

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

    // Execute user comment input
    this.octoApp.webhooks.on(
      'issue_comment.created',
      this.handleCommentCommand,
    );
    this.octoApp.webhooks.on('issue_comment.edited', this.handleCommentCommand);
  }

  get webhooks() {
    return this.octoApp.webhooks;
  }

  async getOcto(): Promise<Octokit> {
    for await (const { octokit } of this.octoApp.eachInstallation.iterator()) {
      return octokit as any;
    }
    throw new Error('no app installation found');
  }

  async init() {
    await this.service.init();
  }
}

export const appFactory = async (setting: AppSetting) => {
  const app = new App(setting);
  await app.init();
  return app;
};

export async function initApp(setting: AppSetting) {
  const app = await appFactory(setting);
  return app;
}

export async function handler(
  req: Request & { params?: { id?: string }; query?: { id?: string } },
  env: Env,
  ctx: ExecutionContext,
) {
  let id = req.params?.id;
  if (!id) {
    id = req.query?.id;
  }
  if (!id) {
    return error(401, 'need a valid id');
  }
  const githubKVManager = new GitHubKVManager(env);
  const setting = await githubKVManager.getAppSettingById(id);
  if (!setting) {
    return error(404, 'id not found');
  }
  if (!setting.githubSecret) {
    return error(401, 'please set app webhook secret in settings');
  }

  const app = await initApp(setting);
  return webhookHandler(app.octoApp.webhooks, req, env, ctx);
}
