type CompareFunc = (command: string, userInput: string) => boolean;

function sanitize(s: string) {
  return s.toString().trim();
}

class HandlerRegistry<T> {
  private _array = new Map<string, T>();

  constructor(public compare: CompareFunc) {}

  add(text: string, handler: T) {
    this._array.set(text, handler);
  }

  find(userInput: string) {
    for (const [t, h] of this._array) {
      if (this.compare(t, userInput)) {
        return h;
      }
    }
  }
}

const equalFunc: CompareFunc = (command: string, userInput: string) => {
  return command === userInput;
};

const startsWith: CompareFunc = (command: string, userInput: string) => {
  return userInput.startsWith(command) || command.startsWith(userInput);
};

export class CommandCenter<T> {
  fallbackHandler: T | undefined;

  eqWrapper: HandlerRegistry<T>;
  swWrapper: HandlerRegistry<T>;
  prefixs = [] as string[];
  constructor(prefixs?: string[]) {
    this.prefixs.push(...(prefixs ?? ['/']));

    this.eqWrapper = new HandlerRegistry<T>(equalFunc);
    this.swWrapper = new HandlerRegistry<T>(startsWith);
  }

  async on(text: string, handler: T, alias?: string[]) {
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

  async resolveHandler(text: string) {
    text = sanitize(text);
    if (!text) {
      return;
    }
    let isCommand = false;
    let commandToHandle = text;
    for (const prefix of this.prefixs) {
      if (text.startsWith(prefix)) {
        commandToHandle = text.slice(prefix.length);
        isCommand = true;
        break;
      }
    }

    if (!isCommand) {
      console.log(
        '没有命中前缀 ' + JSON.stringify(this.prefixs),
        '不当做命令处理',
      );
      return;
    }

    let handler: T | undefined;
    const handlerWrappers = [
      this.eqWrapper,
      this.swWrapper,
    ] as HandlerRegistry<T>[];

    for (const w of handlerWrappers) {
      handler = w.find(commandToHandle);
      if (handler) {
        break;
      }
    }

    if (!handler) {
      console.log(`${text} 没有命中任何处理器`);
      if (this.fallbackHandler) {
        console.log(`${text} fallback to *`);
        handler = this.fallbackHandler;
      }
    }

    if (handler) {
      return handler;
    }
  }
}
