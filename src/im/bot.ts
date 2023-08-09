import { Context } from 'hono';

import { IBotAdapter } from './types';

export class Session {
  constructor(public c: Context<THonoEnvironment>, public impl: IBotAdapter) {}

  async run() {
    await this.impl.handle().catch(async (err) => {
      await this.impl.replyText(
        `处理消息出错: ${(err as Error).message} ${(err as Error).stack}`,
      );
      throw err;
    });
  }

  async runInBackground() {
    this.c.executionCtx.waitUntil(this.run());
  }
}
