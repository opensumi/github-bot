import { equalFunc, regex, startsWith } from './rules';
import type {
  CompareFunc,
  IRegexResolveResult,
  IResolveResult,
  FuncName,
} from './types';

export { CompareFunc, FuncName, equalFunc, regex, startsWith };

class Registry<K, T> {
  private _array = new Map<K, [T, CompareFunc<K>]>();

  get handlers() {
    return Array.from(this._array.entries());
  }

  add(m: K, handler: T, rule: CompareFunc<K>) {
    this._array.set(m, [handler, rule]);
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

  registry = new Registry<string, T>();
  regexRegistry = new Registry<RegExp, T>();

  prefixes = [] as string[];
  constructor(prefixes?: string[]) {
    this.prefixes.push(...(prefixes ?? ['/']));
  }

  async all(handler: T) {
    this.fallbackHandler = handler;
  }

  async on(
    text: string,
    handler: T,
    alias?: string[],
    rule: CompareFunc<string> = equalFunc,
  ) {
    if (text) {
      this.registry.add(text, handler, rule);
      if (alias && Array.isArray(alias)) {
        for (const a of alias) {
          this.registry.add(a, handler, rule);
        }
      }
    }
  }

  async onRegex(reg: RegExp, handler: T) {
    this.regexRegistry.add(reg, handler, regex);
  }

  async resolve(text: string): Promise<IResolveResult | undefined> {
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
    const result = {
      type: 'text',
    } as IResolveResult;
    let { handler } = this.registry.find(command) ?? {};

    if (!handler) {
      const tmp = this.regexRegistry.find(command);
      if (tmp) {
        const { data, handler: regexHandler } = tmp;
        const regexResult = data.exec(command)!;
        (result as IRegexResolveResult).type = 'regex';
        (result as IRegexResolveResult).regex = data;
        (result as IRegexResolveResult).result = regexResult;
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

    result.handler = handler;

    return result;
  }
}
