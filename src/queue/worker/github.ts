import { EmitterWebhookEventName, Webhooks } from '@octokit/webhooks';
import groupBy from 'lodash/groupBy';
import MultiMap from 'mnemonist/multi-map';

import { initApp } from '@/github/app';
import { setupWebhooksTemplate } from '@/github/handler';
import { MarkdownContent } from '@/github/types';
import { sendToDing } from '@/github/utils';
import { GitHubKVManager } from '@/kv/github';
import { ISetting } from '@/kv/types';
import { Logger } from '@/utils/logger';

import { IGitHubEventQueueMessage } from '../types';

import { BaseWorker } from '.';

export class GitHubEventWorker extends BaseWorker<IGitHubEventQueueMessage> {
  logger = Logger.instance();

  constructor(public type: 'app' | 'webhook') {
    super();
  }

  async run() {
    const byId = groupBy(this.queue, (v) => v.body.botId);

    const result = await Promise.allSettled(
      Object.entries(byId).map(async ([botId, messages]) => {
        this.logger.info('consume for', botId, messages.length);

        let hooks: Webhooks<any>;
        let setting: ISetting;
        if (this.type === 'app') {
          const appSetting = await GitHubKVManager.instance().getAppSettingById(
            botId,
          );

          if (!appSetting) {
            this.logger.error(
              'github app worker error: setting not found',
              botId,
            );
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
          hooks = app.webhooks;
          setting = appSetting;
        } else if (this.type === 'webhook') {
          const _setting = await GitHubKVManager.instance().getSettingById(
            botId,
          );
          if (!_setting) {
            this.logger.error(
              'github app worker error: setting not found',
              botId,
            );
            return;
          }

          if (!_setting.githubSecret) {
            this.logger.error(
              'github app worker error: please set webhook secret in database',
              botId,
            );
            return;
          }

          hooks = new Webhooks<{
            octokit: undefined;
          }>({
            secret: _setting.githubSecret,
          });
          setting = _setting;
        } else {
          this.logger.error('github app worker error: unknown type', this.type);
          return;
        }

        const results = new MultiMap<string, MarkdownContent>();

        setupWebhooksTemplate(
          hooks,
          { setting },
          async ({ markdown, eventName }) => {
            results.set(eventName, markdown);
          },
        );

        const byEvent = groupBy(messages, (v) => v.body.data.name) as Record<
          EmitterWebhookEventName,
          Message<IGitHubEventQueueMessage>[]
        >;

        await Promise.allSettled(
          Object.entries(byEvent).map(async ([eventName, messages]) => {
            await Promise.allSettled(
              messages.map(async (message) => {
                try {
                  const { data } = message.body;
                  await hooks.receive({
                    id: data.id,
                    name: data.name as any,
                    payload: data.payload,
                  });
                  message.ack();
                } catch (error) {
                  console.error('github app worker error', error);
                  message.retry();
                }
              }),
            );

            const markdowns = results.get(eventName);
            if (markdowns && markdowns.length > 0) {
              // 只有特定内容的 content 要被合并起来
              await Promise.allSettled(
                markdowns.map((markdown) =>
                  sendToDing(
                    markdown,
                    eventName as EmitterWebhookEventName,
                    setting,
                  ),
                ),
              );
            }
          }),
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
