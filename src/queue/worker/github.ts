import { EmitterWebhookEventName, Webhooks } from '@octokit/webhooks';
import chunk from 'lodash/chunk';
import groupBy from 'lodash/groupBy';
import DefaultMap from 'mnemonist/default-map';

import { initApp } from '@/github/app';
import { setupWebhooksTemplate } from '@/github/handler';
import { MarkdownContent } from '@/github/types';
import { sendToDing } from '@/github/utils';
import { GitHubKVManager } from '@/kv/github';
import { ISetting } from '@/kv/types';
import { Logger } from '@/utils/logger';

import { IGitHubEventQueueMessage } from '../types';

import { BaseWorker } from '.';

export function createUniqueMessageId(data: {
  repository: {
    full_name: string;
  };
  pull_request?: {
    number: number;
  };
  sender: {
    login: string;
  };
}) {
  return `${data.repository.full_name}#${data?.pull_request?.number}#${data?.sender?.login}`;
}

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

        const results = [] as {
          eventName: string;
          markdown: MarkdownContent;
        }[];
        const prReviewResults = new DefaultMap<
          string,
          PullRequestReviewComposite
        >(() => new PullRequestReviewComposite());

        setupWebhooksTemplate(
          hooks,
          { setting },
          async ({ markdown, eventName, payload }) => {
            const result = { eventName, markdown };
            if (eventName.startsWith('pull_request_review.')) {
              const key = createUniqueMessageId(payload);
              prReviewResults.get(key).addPullRequestReview(result);
            } else if (eventName.startsWith('pull_request_review_comment.')) {
              const key = createUniqueMessageId(payload);
              prReviewResults.get(key).addPullRequestReviewComment(result);
            } else {
              results.push(result);
            }
          },
        );

        const byEvent = groupBy(messages, (v) => v.body.data.name) as Record<
          EmitterWebhookEventName,
          Message<IGitHubEventQueueMessage>[]
        >;

        await Promise.allSettled(
          Object.entries(byEvent)
            .map(([_, messages]) => {
              return messages.map(async (message) => {
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
              });
            })
            .flat(),
        );

        prReviewResults.forEach((v) => {
          results.push(...v.toResult());
        });

        console.log(
          `🚀 ~ GitHubEventWorker ~ prReviewResults.forEach ~ results:`,
          results,
        );

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

class PullRequestReviewComposite {
  reviewData!: IResult;
  commentData: IResult[] = [];

  addPullRequestReview(data: IResult) {
    this.reviewData = data;
  }

  addPullRequestReviewComment(data: IResult) {
    this.commentData.push(data);
  }

  toResult() {
    const { reviewData, commentData } = this;

    const chunked = chunk(commentData, 5);
    const result = [] as IResult[];

    chunked.forEach((v, i) => {
      let title = '';
      let eventName = '';
      let text = v.map((d) => d.markdown.text).join('\n\n');

      if (i === 0 && reviewData) {
        title = reviewData.markdown.title;
        eventName = reviewData.eventName;
        text = reviewData.markdown.text + '\n\n' + text;
      } else if (commentData.length > 0) {
        title = commentData[0].markdown.title;
        eventName = commentData[0].eventName;
      }

      result.push({
        eventName,
        markdown: {
          title: `${title} (${i + 1}/${chunked.length})`,
          text,
        },
      });
    });

    return result;
  }
}

interface IResult {
  eventName: string;
  markdown: MarkdownContent;
}
