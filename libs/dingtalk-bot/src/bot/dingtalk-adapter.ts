import { CommandCenter, ICommandCenterOptions } from '@opensumi/bot-commander';
import { Session } from './session';

export class DingBotAdapter<
  CommandCenterContext extends {
    session: Session;
  },
> {
  public cc: CommandCenter<CommandCenterContext>;

  constructor(
    public id: string,
    public commandOptions?: ICommandCenterOptions<CommandCenterContext>,
  ) {
    this.cc = new CommandCenter(commandOptions);
  }

  protected async constructContext(
    session: Session,
  ): Promise<CommandCenterContext> {
    return {
      session,
    } as CommandCenterContext;
  }

  async handle(
    session: Session,
    options?: {
      timeout?: number | null;
    },
  ) {
    const msg = session.msg;
    console.log(
      `${this.id} receive dingtalk msg: `,
      JSON.stringify(msg, null, 2),
    );

    // 其实目前钉钉机器人也就支持这一种消息类型
    if (msg.msgtype === 'text') {
      const text = session.text;
      console.log(`DingBot ~ handle ~ text`, text);

      try {
        await this.cc.tryHandle(
          text,
          await this.constructContext(session),
          options,
        );
      } catch (err) {
        await session.replyText(
          `处理消息出错: ${(err as Error).message} ${(err as Error).stack}`,
        );
        throw err;
      }
    }
  }
}
