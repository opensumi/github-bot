import { App as OctoApp } from '@octokit/app';
import { Octokit } from '@octokit/rest';
import { ISetting, AppSetting, GitHubKVManager } from '@/github/storage';
import { baseHandler, setupWebhooksTemplate } from './handler';
import { handleCommentCommand } from './commands';
import { sendToDing } from './utils';
import { error } from '@/runtime/response';
import { AppService } from './service';

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
  app: OctoApp;

  constructor(private setting: AppSetting) {
    const { appSettings, githubSecret } = setting;
    this.app = new OctoApp({
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
    setupWebhooksTemplate(this.app.webhooks, this.ctx);
    this.service = new AppService(this, setting);

    this.app.webhooks.on('star.created', async ({ payload }) => {
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
    this.app.webhooks.on('issue_comment.created', handleCommentCommand);
    this.app.webhooks.on('issue_comment.edited', handleCommentCommand);
  }

  get webhooks() {
    return this.app.webhooks;
  }

  async getOcto(): Promise<Octokit> {
    for await (const { octokit } of this.app.eachInstallation.iterator()) {
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
  return baseHandler(app.app.webhooks, req, env, ctx);
}
