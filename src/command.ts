type CompareFunc = (command: string, userInput: string) => boolean;

export type FuncName = 'equal' | 'startwiths';

const equalFunc: CompareFunc = (command: string, userInput: string) => {
  return command === userInput;
};

const startsWith: CompareFunc = (command: string, userInput: string) => {
  return userInput.startsWith(command) || command.startsWith(userInput);
};

const compareFuncMap = {
  equal: equalFunc,
  startwiths: startsWith,
} as {
  [key in FuncName]: CompareFunc;
};

function sanitize(s: string) {
  return s.toString().trim();
}

class Registry<T> {
  private _array = new Map<string, T>();
  private _funcNameArray = new Map<string, FuncName>();

  add(text: string, handler: T, compareFunc: FuncName) {
    this._array.set(text, handler);
    this._funcNameArray.set(text, compareFunc);
  }

  find(userInput: string) {
    for (const [t, h] of this._array) {
      const compare = compareFuncMap[this._funcNameArray.get(t) ?? 'equal'];
      if (compare(t, userInput)) {
        return h;
      }
    }
  }
}

export class CommandCenter<T> {
  fallbackHandler: T | undefined;

  reg: Registry<T>;
  prefixs = [] as string[];
  constructor(prefixs?: string[]) {
    this.prefixs.push(...(prefixs ?? ['/']));

    this.reg = new Registry<T>();
  }

  async on(
    text: string,
    handler: T,
    alias?: string[],
    funcName: FuncName = 'equal',
  ) {
    if (text) {
      if (text === '*') {
        this.fallbackHandler = handler;
      } else {
        this.reg.add(text, handler, funcName);
        if (alias && Array.isArray(alias)) {
          for (const a of alias) {
            this.reg.add(a, handler, funcName);
          }
        }
      }
    }
  }

  async resolve(text: string) {
    text = sanitize(text);
    if (!text) {
      return;
    }
    let isCommand = false;
    let command = text;
    for (const prefix of this.prefixs) {
      if (text.startsWith(prefix)) {
        command = text.slice(prefix.length);
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

    let handler = this.reg.find(command);

    if (!handler) {
      console.log(`${text} 没有命中任何 handler`);
      if (this.fallbackHandler) {
        console.log(`${text} fallback to *`);
        handler = this.fallbackHandler;
      }
    }

    return handler;
  }
}
