import { Octokit } from '@octokit/rest';
import { Webhooks } from '@octokit/webhooks';
import {
  EmitterWebhookEvent,
  WebhookEventHandlerError,
} from '@octokit/webhooks/dist-types/types';

import Environment from '@/env';
import { error, json } from '@/utils/api/response';
import { Logger } from '@/utils/logger';

import { ValidationError } from '@/services/github';
import { SwitchesService } from '@/services/switches';

export class WebhookService {
  private static _instance: WebhookService | undefined;
  static instance() {
    if (!this._instance) {
      this._instance = new WebhookService();
    }

    return this._instance;
  }

  private constructor() {}

  async handle(
    botId: string,
    type: 'github-app' | 'github-webhook',
    webhooks: Webhooks<{ octokit?: Octokit }>,
    execContext: ExecutionContext,
    data: EmitterWebhookEvent,
  ) {
    const logger = Logger.instance();
    const { id, name } = data;
    try {
      logger.info('receive github webhook, id: ${id}, name: ${name}');
      try {
        const useQueue =
          Environment.instance().Queue &&
          (await SwitchesService.instance().isEnableQueue(id));

        if (useQueue) {
          logger.info('send to queue');
          await Environment.instance().Queue.send(
            {
              botId,
              type,
              data,
            },
            {
              contentType: 'json',
            },
          );
        } else {
          execContext.waitUntil(webhooks.receive(data));
        }

        return json({
          id,
          name,
          message: 'ok',
        });
      } catch (err) {
        let status = 500;
        if ((err as WebhookEventHandlerError).name === 'AggregateError') {
          const statusCode = Array.from(err as WebhookEventHandlerError)[0]
            .status;
          if (statusCode) {
            status = statusCode;
          }
        }
        if ((err as any).code) {
          status = (err as any).code;
        }
        console.error('error in webhookHandler', err);
        return error(status, String(err));
      }
    } catch (err) {
      const errorCode = (err as ValidationError).statusCode ?? 500;
      const message =
        (err as ValidationError).message ?? 'Unknown error in validation';
      console.error('error in webhookHandler', err);
      return error(errorCode, message);
    }
  }
}
