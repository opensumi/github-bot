import { Context } from 'hono';

import Environment from '@/env';
import { App, initApp } from '@/github/app';
import { DingKVManager, DingUserKVManager } from '@/kv/ding';
import { GitHubKVManager } from '@/kv/github';
import { IDingBotSetting } from '@/kv/types';
import * as types from '@opensumi/dingtalk-bot/lib/types';
import { Message } from '@opensumi/dingtalk-bot/lib/types';
import { send } from '@opensumi/dingtalk-bot/lib/utils';

import { cc } from '../commands';
import { IBotAdapter } from '../types';

function prepare(s: string) {
  return s.toString().trim();
}

export class DingBotAdapter implements IBotAdapter {
  githubKVManager: GitHubKVManager;
  userInfoKVManager: DingUserKVManager;

  constructor(
    public id: string,
    public c: Context<THonoEnvironment>,
    public msg: Message,
    public kvManager: DingKVManager,
    public ctx: ExecutionContext,
    public setting: IDingBotSetting,
  ) {
    this.githubKVManager = GitHubKVManager.instance();
    this.userInfoKVManager = new DingUserKVManager();
  }

  async handle() {
    const msg = this.msg;
    console.log(
      `${this.id} receive dingtalk msg: `,
      JSON.stringify(msg, null, 2),
    );

    let app: App | undefined;
    const setting = await this.githubKVManager.getAppSettingById(this.id);
    if (setting) {
      app = await initApp(setting);
    }

    // 其实目前钉钉机器人也就支持这一种消息类型
    if (msg.msgtype === 'text') {
      const text = prepare(msg.text.content);
      console.log(`DingBot ~ handle ~ text`, text);

      await cc.tryHandle(
        text,
        {
          bot: this,
          ctx: {
            message: msg,
            app,
          },
        },
        {
          timeout: Environment.instance().timeout,
        },
      );
    }
  }

  async replyText(text: string, contentExtra: Record<string, any> = {}) {
    await this.reply(types.compose(types.text(text), contentExtra));
  }

  async reply(content: types.SendMessage) {
    console.log(`DingBot ~ reply:`, JSON.stringify(content));
    await send(content, this.msg.sessionWebhook);
  }
}
