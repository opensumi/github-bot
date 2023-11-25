import { EmitterWebhookEventName } from '@octokit/webhooks';
import chain from 'lodash/chain';
import MultiMap from 'mnemonist/multi-map';

import { initApp } from '@/github/app';
import { setupWebhooksTemplate } from '@/github/handler';
import { MarkdownContent } from '@/github/types';
import { sendToDing } from '@/github/utils';
import { GitHubKVManager } from '@/kv/github';

import { IGitHubEventQueueMessage } from '../types';

import { BaseWorker } from '.';

export class GitHubAppWorker extends BaseWorker<IGitHubEventQueueMessage> {
  async run() {
    await Promise.allSettled(
      chain(this.queue)
        .groupBy((v) => v.body.botId)
        .map(async (messages, botId) => {
          const githubKVManager = new GitHubKVManager();
          const setting = await githubKVManager.getAppSettingById(botId);

          if (setting && setting.githubSecret) {
            const app = await initApp(setting);

            const results = new MultiMap<string, MarkdownContent>();

            setupWebhooksTemplate(
              app.webhooks,
              { setting },
              async ({ markdown, eventName }) => {
                results.set(eventName, markdown);
              },
            );

            await Promise.allSettled(
              chain(messages)
                .groupBy((v) => v.body.data.event)
                .map(async (messages, eventName: EmitterWebhookEventName) => {
                  await Promise.all(
                    messages.map(async (message) => {
                      try {
                        const { data } = message.body;
                        await app.webhooks.receive({
                          id: data.id,
                          name: data.event as any,
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
                        sendToDing(markdown, eventName, setting),
                      ),
                    );
                  }
                })
                .value(),
            );
          } else {
            console.error('github app worker error: setting not found', botId);
          }
        })
        .value(),
    );
  }
}
