import { App as OctoApp } from '@/lib/app.js/src';
import { Octokit } from '@octokit/rest';
import { ISetting, AppSetting, GitHubKVManager } from '@/github/storage';
import { webhookHandler, setupWebhooksTemplate } from './handler';
import { handleCommentCommand } from './commands';
import { sendToDing } from './utils';
import { error } from '@/runtime/response';
import { AppService } from './service';
import { workflowAboutRelease } from '@/constants/opensumi';

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
  octo: OctoApp;

  constructor(private setting: AppSetting) {
    const { appSettings, githubSecret } = setting;
    this.octo = new OctoApp({
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
    setupWebhooksTemplate(this.octo.webhooks, this.ctx);
    this.service = new AppService(this, setting);

    this.octo.webhooks.on('star.created', async ({ payload }) => {
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
    this.octo.webhooks.on('issue_comment.created', handleCommentCommand);
    this.octo.webhooks.on('issue_comment.edited', handleCommentCommand);
    this.octo.webhooks.on('workflow_run.completed', async ({ payload }) => {
      const workflow = payload.workflow;
      const workflowRun = payload.workflow_run;
      const repository = payload.repository;
      if (repository.full_name === 'opensumi/core') {
        if (workflowAboutRelease.has(workflow.name)) {
          await this.service.syncVersion();
          await sendToDing(
            {
              title: 'Start Sync Version',
              text: `${workflow.name} ${workflowRun.status}, start sync packages to npmmirror.
[see progress here](https://github.com/opensumi/actions/actions/workflows/sync.yml)
I will notify you when sync done.`,
            },
            'star.created',
            this.ctx.setting,
          );
        }
      }
    });
  }

  get webhooks() {
    return this.octo.webhooks;
  }

  async getOcto(): Promise<Octokit> {
    for await (const { octokit } of this.octo.eachInstallation.iterator()) {
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
  return webhookHandler(app.octo.webhooks, req, env, ctx);
}
