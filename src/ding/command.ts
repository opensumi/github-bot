import { Message, send } from '.';

type Handler = (msg: Message) => Promise<void>;

function santize(s: string) {
  return s.toString().trim();
}

export abstract class HandlerWrapper {
  private _array = new Map<string, Handler>();

  add(text: string, handler: Handler) {
    this._array.set(text, handler);
  }

  abstract compare(command: string, userInput: string): boolean;

  find(userInput: string) {
    for (const [t, h] of this._array) {
      if (this.compare(t, userInput)) {
        return h;
      }
    }
  }
}

export class EqHandlerWrapper extends HandlerWrapper {
  compare(command: string, userInput: string): boolean {
    return command === userInput;
  }
}

export class StartWithHandlerWrapper extends HandlerWrapper {
  compare(command: string, userInput: string): boolean {
    return command.startsWith(userInput);
  }
}

export class CommandCenter {
  private handlerWrappers = [] as HandlerWrapper[];
  eqWrapper: EqHandlerWrapper;
  swWrapper: StartWithHandlerWrapper;

  fallbackHandler: Handler | undefined;

  constructor() {
    this.eqWrapper = new EqHandlerWrapper();
    this.swWrapper = new StartWithHandlerWrapper();
    this.handlerWrappers.push(this.eqWrapper);
    this.handlerWrappers.push(this.swWrapper);
  }

  async on(text: string, handler: Handler, alias?: string[]) {
    if (text) {
      if (text === '*') {
        this.fallbackHandler = handler;
      } else {
        this.eqWrapper.add(text, handler);
        if (alias && Array.isArray(alias)) {
          for (const a of alias) {
            this.eqWrapper.add(a, handler);
          }
        }
      }
    }
  }

  async handle(msg: Message) {
    const text = santize(msg['text']['content']);
    if (!text) {
      return;
    }

    if (!text.startsWith('/')) {
      return;
    }
    const commandToHandle = text.slice(1);

    let handler: Handler | undefined;

    for (const w of this.handlerWrappers) {
      handler = w.find(commandToHandle);
      if (handler) {
        break;
      }
    }

    if (!handler) {
      console.log(`${text} 没有触发任何指令`);
      if (!this.fallbackHandler) {
        return;
      }
      console.log(`${text} fallback to *`);
      handler = this.fallbackHandler;
    }
    const result = await handler(msg);
    return result;
  }
}

export const commandCenter = new CommandCenter();

commandCenter.on('*', async (msg) => {
  await send(
    {
      msgtype: 'text',
      text: {
        content: `@${msg.senderId}你好哇，我是 Sumi`,
      },
      at: {
        atDingtalkIds: [msg.senderId],
      },
    },
    msg.sessionWebhook,
  );
});
