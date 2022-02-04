type CompareFunc = (command: string, userInput: string) => boolean;

function sanitize(s: string) {
  return s.toString().trim();
}

class Registry<T> {
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

  eqReg: Registry<T>;
  swReg: Registry<T>;
  prefixs = [] as string[];
  constructor(prefixs?: string[]) {
    this.prefixs.push(...(prefixs ?? ['/']));

    this.eqReg = new Registry<T>(equalFunc);
    this.swReg = new Registry<T>(startsWith);
  }

  async on(text: string, handler: T, alias?: string[]) {
    if (text) {
      if (text === '*') {
        this.fallbackHandler = handler;
      } else {
        this.eqReg.add(text, handler);
        if (alias && Array.isArray(alias)) {
          for (const a of alias) {
            this.eqReg.add(a, handler);
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

    let handler: T | undefined;
    const regs = [this.eqReg, this.swReg] as Registry<T>[];

    for (const r of regs) {
      handler = r.find(command);
      if (handler) {
        break;
      }
    }

    if (!handler) {
      console.log(`${text} 没有命中任何 handler`);
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
