import { Context } from 'hono';

import { ConversationKVManager } from '@/ai/conversation/kvManager';
import Environment from '@/env';
import { initApp, App } from '@/github/app';
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
  conversationKVManager: ConversationKVManager;
  userInfoKVManager: DingUserKVManager;

  constructor(
    public id: string,
    public c: Context<THonoEnvironment>,
    public msg: Message,
    public kvManager: DingKVManager,
    public ctx: ExecutionContext,
    public setting: IDingBotSetting,
  ) {
    this.githubKVManager = new GitHubKVManager();
    this.conversationKVManager = new ConversationKVManager(msg);
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
      const parsed = cc.parseCliArgs(text);
      console.log(`DingBot ~ handle ~ parsed`, JSON.stringify(parsed));

      await cc.tryHandle(
        parsed.arg0,
        {
          bot: this,
          ctx: {
            message: msg,
            parsed,
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

  getProxiedUrl(url: string) {
    return this.c.getProxiedUrl(url);
  }
}
