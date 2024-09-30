import { CommandCenter, ICommandCenterOptions } from '@opensumi/bot-commander';
import * as types from '../types';
import { send } from '../utils';
import { IBotAdapter } from './base-adapter';

function prepare(s: string) {
  return s.toString().trim();
}

export class DingBotAdapter<CommandCenterContext extends Record<string, any>>
  implements IBotAdapter
{
  public cc: CommandCenter<CommandCenterContext>;

  constructor(
    public id: string,
    public msg: types.Message,
    public commandOptions?: ICommandCenterOptions<CommandCenterContext>,
  ) {
    this.cc = new CommandCenter(commandOptions);
  }

  public async getContext(): Promise<CommandCenterContext> {
    return {} as CommandCenterContext;
  }

  async handle(options?: {
    timeout?: number | null;
  }) {
    const msg = this.msg;
    console.log(
      `${this.id} receive dingtalk msg: `,
      JSON.stringify(msg, null, 2),
    );

    // 其实目前钉钉机器人也就支持这一种消息类型
    if (msg.msgtype === 'text') {
      const text = prepare(msg.text.content);
      console.log(`DingBot ~ handle ~ text`, text);

      await this.cc.tryHandle(text, await this.getContext(), options);
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
