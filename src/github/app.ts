import { App as OctoApp } from '@octokit/app';
import { Octokit } from '@octokit/rest';
import { HandlerFunction } from '@octokit/webhooks/dist-types/types';

import { PrivilegeEvent } from '@/constants';
import { ActionsRepo, VERSION_SYNC_KEYWORD } from '@/constants/opensumi';
import Environment from '@/env';
import { AppSetting } from '@/kv/types';

import { CommandContext, issueCc } from './commands';
import { parseCommandInMarkdownComments } from './commands/parse';
import { sendToDing } from './dingtalk';
import { setupWebhooksTemplate } from './handler';
import { OpenSumiOctoService } from './service/opensumi';

export class App {
  octoService: OpenSumiOctoService;

  octoApp: OctoApp<{ Octokit: typeof Octokit }>;

  constructor(public setting: AppSetting) {
    const { appSettings, githubSecret } = setting;
    this.octoService = new OpenSumiOctoService();

    this.octoApp = new OctoApp({
      appId: appSettings.appId,
      privateKey: appSettings.privateKey,
      webhooks: {
        secret: githubSecret,
      },
      Octokit: Octokit,
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

  handleSyncVersion = async (fullname: string, data: string) => {
    const [tag, version] = data.split(' | ');

    let file = '';
    let name = '';
    switch (fullname) {
      case 'opensumi/core':
        file = ActionsRepo.SYNC_FILE;
        name = 'opensumi';
        await this.octoService.syncOpenSumiVersion(version);
        break;
      case 'opensumi/codeblitz':
        file = ActionsRepo.SYNC_CODEBLITZ_FILE;
        name = 'codeblitz';
        await this.octoService.syncCodeblitzVersion(version);
        break;
      default:
        throw new Error('unknown repo');
    }

    await sendToDing(
      {
        title: 'Starts Synchronizing',
        text: `[${fullname}] ${tag} has published. [starts synchronizing ${name} packages@${version} to npmmirror](https://github.com/opensumi/actions/actions/workflows/${file})`,
      },
      PrivilegeEvent,
      this.setting,
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
    const { comment, repository } = payload;
    const fullname = repository.full_name;

    await issueCc.tryHandle(
      comment.body,
      {
        app: this,
        id,
        name,
        payload,
        octokit,
      } as unknown as CommandContext,
      {
        timeout: Environment.instance().timeout,
      },
    );

    // 开始处理第一行注释中隐含的命令 <!-- versionInfo: RC | 2.20.5-rc-1665562305.0 -->
    const commands = parseCommandInMarkdownComments(comment.body);
    if (commands) {
      if (commands[VERSION_SYNC_KEYWORD]) {
        await this.handleSyncVersion(fullname, commands[VERSION_SYNC_KEYWORD]);
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

  async createReactionForIssueComment(
    ctx: CommandContext,
    reaction:
      | '+1'
      | '-1'
      | 'laugh'
      | 'confused'
      | 'heart'
      | 'hooray'
      | 'rocket'
      | 'eyes',
  ) {
    const { payload, octokit } = ctx;
    const { comment } = payload;
    return await octokit.reactions.createForIssueComment({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      comment_id: comment.id,
      content: reaction,
    });
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
    this.octoService.octo = await this.getOcto();
  }

  listenWebhooks() {
    setupWebhooksTemplate(
      this.octoApp.webhooks,
      {
        setting: this.setting,
      },
      async ({ markdown, eventName }) => {
        await sendToDing(markdown, eventName, this.setting);
      },
    );
  }
}

export async function initApp(setting: AppSetting) {
  const app = new App(setting);
  await app.init();
  console.log('init app success');
  return app;
}
