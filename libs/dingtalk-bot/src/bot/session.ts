import { IBotAdapter } from './base-adapter';

export class Session {
  constructor(public impl: IBotAdapter) {}

  async run() {
    await this.impl.handle().catch(async (err: Error) => {
      await this.impl.replyText(
        `处理消息出错: ${(err as Error).message} ${(err as Error).stack}`,
      );
      throw err;
    });
  }
}
