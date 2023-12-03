import { CancellationToken } from '@opensumi/ide-utils';
import { createCancelablePromise } from '@opensumi/ide-utils/lib/async';
import { isPromiseCanceledError } from '@opensumi/ide-utils/lib/errors';
import mri from 'mri';

import { Registry } from './registry';
import { equalFunc, regex, startsWith } from './rules';
import type {
  CompareFunc,
  IRegexResolveResult,
  IResolveResult,
  FuncName,
  ITextResolveResult,
} from './types';

export { CompareFunc, FuncName, equalFunc, regex, startsWith };

export interface IArgv<T> {
  raw: mri.Argv<T>;
  arg0: string;
  _: string[];
}

export interface BaseContext<Result> {
  /**
   * the original string
   */
  text: string;
  token: CancellationToken;
  result: Result;
  cc: CommandCenter<any>;
  [key: string]: any;
}

type TRegexHandler<C> = (
  ctx: C & BaseContext<IRegexResolveResult>,
  argv: IArgv<any>,
) => Promise<void>;

type TTextHandler<C> = (
  ctx: C & BaseContext<ITextResolveResult>,
  argv: IArgv<any>,
) => Promise<void>;

type TFallbackHandler<C> = (
  ctx: C & BaseContext<void>,
  argv: IArgv<any>,
) => Promise<void>;

type THandler<C> = TRegexHandler<C> | TTextHandler<C> | TFallbackHandler<C>;

export interface ICommandCenterOptions<C> {
  prefix?: string[];
  replyText?: (c: C) => (text: string) => Promise<void>;
  timeout?: number;
}

export class CommandCenter<C extends Record<string, any>> {
  fallbackHandler: TFallbackHandler<C> | undefined;

  registry = new Registry<string, THandler<C>>();
  regexRegistry = new Registry<RegExp, THandler<C>>();

  prefixes = [] as string[];
  constructor(private options: ICommandCenterOptions<C> = {}) {
    this.prefixes = options.prefix ?? ['/'];
  }

  async all(handler: TFallbackHandler<C>) {
    this.fallbackHandler = handler;
  }
  async on(pattern: RegExp, handler: TRegexHandler<C>): Promise<void>;
  async on(
    pattern: string,
    handler: TTextHandler<C>,
    alias?: string[],
    rule?: CompareFunc<string>,
  ): Promise<void>;
  async on(
    pattern: string | RegExp,
    handler: THandler<C>,
    alias?: string[],
    rule: CompareFunc<string> = equalFunc,
  ) {
    if (pattern) {
      if (typeof pattern === 'string') {
        this.registry.add(pattern, handler, rule);
        if (alias && Array.isArray(alias)) {
          for (const a of alias) {
            this.registry.add(a, handler, rule);
          }
        }
      } else if (typeof pattern === 'object' && pattern instanceof RegExp) {
        this.regexRegistry.add(pattern, handler, regex);
      }
    }
  }

  async resolve(text: string): Promise<IResolveResult | undefined> {
    if (!text) {
      return;
    }

    let isCommand = false;
    let toResolve = text;
    for (const prefix of this.prefixes) {
      if (text.startsWith(prefix)) {
        toResolve = text.slice(prefix.length);
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
      command: toResolve,
    } as IResolveResult;
    let { handler } = this.registry.find(toResolve) ?? {};

    if (!handler) {
      const tmp = this.regexRegistry.find(toResolve);
      if (tmp) {
        const { data, handler: regexHandler } = tmp;
        const regexResult = data.exec(toResolve)!;
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

  parseCliArgs<T extends Record<string, any>>(command: string): IArgv<T> {
    const result = mri<T>(command.split(' '));
    result['_'] = result._.filter(Boolean);
    return {
      raw: result,
      arg0: result._[0],
      _: result._,
    };
  }

  async replyText(c: C, text: string) {
    await this.options?.replyText?.(c)(text);
  }

  async tryHandle(
    str: string,
    payload: C,
    options?: { timeout?: number | null },
  ) {
    // remove redundant \r\n
    str = str.trim();
    const result = await this.resolve(str);
    const c = {
      ...payload,
      text: str,
      result,
      cc: this,
    } as unknown as C & BaseContext<IResolveResult>;
    if (result && result.handler) {
      const p = createCancelablePromise((token) => {
        c.token = token;
        return result.handler(c);
      });

      let timeoutToClear: ReturnType<typeof setTimeout> | undefined;
      const timeoutNumber = options?.timeout ?? this.options.timeout;
      if (typeof timeoutNumber === 'number') {
        console.log('command center timeout:', timeoutNumber);
        timeoutToClear = setTimeout(() => {
          p.cancel();
        }, timeoutNumber);
      }

      p.then(() => {
        timeoutToClear && clearTimeout(timeoutToClear);
      }).catch(async (error) => {
        if (isPromiseCanceledError(error)) {
          await this.replyText(c, `executing [${str}] timeout`);
          return;
        }

        await this.replyText(
          c,
          `error when executing [${str}]: ${(error as Error).message}`,
        );
      });

      await p;
    } else {
      console.log('no handler found for', str);
    }
  }
}
