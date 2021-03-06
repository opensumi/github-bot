type CompareFunc<T> = (command: T, userInput: string) => boolean;

export type FuncName = 'equal' | 'startwiths';

export const equalFunc: CompareFunc<string> = (
  command: string,
  userInput: string,
) => {
  return command === userInput;
};

export const startsWith: CompareFunc<string> = (
  command: string,
  userInput: string,
) => {
  return userInput.startsWith(command) || command.startsWith(userInput);
};

export const regex = (reg: RegExp, userInput: string) => {
  return Boolean(userInput.match(reg));
};

class Registry<K, T> {
  private _array = new Map<K, [T, CompareFunc<K>]>();

  get handlers() {
    return Array.from(this._array.entries());
  }

  add(m: K, handler: T, compareFunc: CompareFunc<K>) {
    this._array.set(m, [handler, compareFunc]);
  }

  find(userInput: string) {
    for (const [m, h] of this._array) {
      const [handler, compareFunc] = h;
      if (compareFunc(m, userInput)) {
        return { data: m, handler };
      }
    }
  }
}

export class CommandCenter<T> {
  fallbackHandler: T | undefined;

  reg = new Registry<string, T>();
  regexReg = new Registry<RegExp, T>();

  prefixes = [] as string[];
  constructor(prefixes?: string[]) {
    this.prefixes.push(...(prefixes ?? ['/']));
  }

  async on(
    text: string,
    handler: T,
    alias?: string[],
    funcName: CompareFunc<string> = equalFunc,
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

  async onRegex(reg: RegExp, handler: T) {
    this.regexReg.add(reg, handler, regex);
  }

  async resolve(text: string) {
    if (!text) {
      return;
    }
    let isCommand = false;
    let command = text;
    for (const prefix of this.prefixes) {
      if (text.startsWith(prefix)) {
        command = text.slice(prefix.length);
        isCommand = true;
        break;
      }
    }

    if (!isCommand) {
      console.log(
        `no prefix found for ${text}, prefixes: ${JSON.stringify(
          this.prefixes,
        )}`,
      );
      return;
    }

    let { handler } = this.reg.find(command) ?? {};

    if (!handler) {
      const { data, handler: regexHandler } = this.regexReg.find(command) ?? {};
      if (regexHandler) {
        (regexHandler as any).type = 'regex';
        (regexHandler as any).regex = data;
        handler = regexHandler;
      }
    }

    if (!handler && this.fallbackHandler) {
      console.log(`${text} fallback to *`);
      handler = this.fallbackHandler;
    }
    if (handler) {
      console.log(`${text} will be handled`);
    }
    return handler;
  }
}
