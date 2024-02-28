import { EmitterWebhookEventName, Webhooks } from '@octokit/webhooks';
import chunk from 'lodash/chunk';
import groupBy from 'lodash/groupBy';
import DefaultMap from 'mnemonist/default-map';

import { initApp } from '@/github/app';
import { setupWebhooksTemplate } from '@/github/handler';
import { TemplateRenderResult } from '@/github/templates';
import { sendToDing } from '@/github/utils';
import { GitHubKVManager } from '@/kv/github';
import { ISetting } from '@/kv/types';
import { Logger } from '@/utils/logger';

import { IGitHubEventQueueMessage } from '../types';

import { BaseWorker } from '.';

export function createUniqueMessageId(
  data: {
    repository: {
      full_name: string;
    };
    pull_request?: {
      number: number;
    };
    discussion?: {
      number: number;
    };
    sender: {
      login: string;
    };
  },
  prefix = '',
) {
  return `${prefix}#${data?.repository?.full_name}#${data?.pull_request?.number}#${data?.discussion?.number}#${data?.sender?.login}`;
}

export interface IOctokitShape {
  webhooks: Webhooks<any>;
  setting: ISetting;
}

export class GitHubEventWorker extends BaseWorker<IGitHubEventQueueMessage> {
  logger = Logger.instance();

  constructor(public type: 'app' | 'webhook') {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBatchDoneForTest(results: IResult[]) {
    // do nothing
  }

  async createGitHubApp(botId: string): Promise<IOctokitShape | undefined> {
    const appSetting = await GitHubKVManager.instance().getAppSettingById(
      botId,
    );

    if (!appSetting) {
      this.logger.error('github app worker error: setting not found', botId);
      return;
    }

    if (!appSetting.githubSecret) {
      this.logger.error(
        'github app worker error: please set app webhook secret in database',
        botId,
      );
      return;
    }

    const app = await initApp(appSetting);
    return {
      webhooks: app.webhooks,
      setting: appSetting,
    };
  }

  async createWebhook(botId: string): Promise<IOctokitShape | undefined> {
    const _setting = await GitHubKVManager.instance().getSettingById(botId);
    if (!_setting) {
      this.logger.error('github app worker error: setting not found', botId);
      return;
    }

    if (!_setting.githubSecret) {
      this.logger.error(
        'github app worker error: please set webhook secret in database',
        botId,
      );
      return;
    }

    const webhooks = new Webhooks<{
      octokit: undefined;
    }>({
      secret: _setting.githubSecret,
    });
    const setting = _setting;

    return {
      webhooks,
      setting,
    };
  }

  async run() {
    const byId = groupBy(this.queue, (v) => v.body.botId);

    const result = await Promise.allSettled(
      Object.entries(byId).map(async ([botId, messages]) => {
        this.logger.info('consume for', botId, messages.length);

        let octokit: IOctokitShape | undefined;

        if (this.type === 'app') {
          octokit = await this.createGitHubApp(botId);
        } else if (this.type === 'webhook') {
          octokit = await this.createWebhook(botId);
        } else {
          this.logger.error('github app worker error: unknown type', this.type);
          return;
        }

        if (!octokit) {
          this.logger.error('cannot get octokit info for ', botId);
          return;
        }

        const results = [] as IResult[];
        const multiViewResults = new DefaultMap<string, EventComposite>(
          (key) => new EventComposite(key),
        );

        const { webhooks, setting } = octokit;

        setupWebhooksTemplate(
          webhooks,
          { setting, queueMode: true },
          async ({ markdown, name, eventName, payload }) => {
            const result = { eventName, markdown };
            switch (name) {
              case 'pull_request_review': {
                const key = createUniqueMessageId(payload, 'pr_review');
                multiViewResults.get(key).setMainView(result);
                break;
              }
              case 'pull_request_review_comment': {
                const key = createUniqueMessageId(payload, 'pr_review');
                multiViewResults.get(key).addSubView(result);
                break;
              }
              case 'discussion': {
                const key = createUniqueMessageId(payload, 'discussion');
                multiViewResults.get(key).setMainView(result);
                break;
              }
              case 'discussion_comment': {
                const key = createUniqueMessageId(payload, 'discussion');
                multiViewResults.get(key).addSubView(result);
                break;
              }
              default: {
                results.push(result);
                break;
              }
            }
          },
        );

        await Promise.allSettled(
          messages.map(async (message) => {
            try {
              await webhooks.receive(message.body.data);
              message.ack();
            } catch (error) {
              console.error('github app worker error', error);
              message.retry();
            }
          }),
        );

        multiViewResults.forEach((v) => {
          results.push(...v.toResult());
        });

        this.onBatchDoneForTest(results);

        await Promise.allSettled(
          results.map(({ markdown, eventName }) =>
            sendToDing(markdown, eventName as EmitterWebhookEventName, setting),
          ),
        );
      }),
    );

    result.forEach((v) => {
      if (v.status === 'rejected') {
        console.error('github app worker error', v);
      }
    });
  }
}

class EventComposite {
  mainView!: IResult;
  subView: IResult[] = [];

  constructor(public key: string) {}

  setMainView(data: IResult) {
    this.mainView = data;
  }

  addSubView(data: IResult) {
    this.subView.push(data);
  }

  toResult() {
    const { mainView, subView } = this;

    const result = [] as IResult[];

    const separator = '\n\n***\n\n';

    if (subView.length > 0) {
      const chunked = chunk(subView, 5);
      chunked.forEach((v, i) => {
        let title = '';
        let eventName = '';
        let text = v
          .map((d) => d.markdown.compactText || d.markdown.text)
          .join(separator);

        if (i === 0 && mainView) {
          title = mainView.markdown.title;
          eventName = mainView.eventName;
          text = mainView.markdown.text + separator + text;
        } else if (subView.length > 0) {
          title = subView[0].markdown.title;
          eventName = subView[0].eventName;
        }

        result.push({
          eventName,
          markdown: {
            title,
            text,
          },
        });
      });
    } else if (mainView) {
      result.push(mainView);
    }

    return result;
  }
}

interface IResult {
  eventName: string;
  markdown: TemplateRenderResult;
}
