import { Message } from '.';

type Handler = (t: string) => Promise<void>;

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

  constructor() {
    this.eqWrapper = new EqHandlerWrapper();
    this.swWrapper = new StartWithHandlerWrapper();
    this.handlerWrappers.push(this.eqWrapper);
    this.handlerWrappers.push(this.swWrapper);
  }

  async on(text: string, handler: Handler, alias?: string[]) {
    this.eqWrapper.add(text, handler);
    if (alias && Array.isArray(alias)) {
      for (const a of alias) {
        this.eqWrapper.add(a, handler);
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
    let commandToHandle = text.slice(1);

    let handler: Handler | undefined;

    for (const w of this.handlerWrappers) {
      handler = w.find(commandToHandle);
      if (handler) {
        break;
      }
    }

    if (!handler) {
      console.log(`${text} 没有触发任何指令`);
      return;
    }
    const result = await handler(text);
    return result;
  }
}

export const commandCenter = new CommandCenter();
