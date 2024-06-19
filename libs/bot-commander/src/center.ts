import { AsyncLocalStorage } from 'node:async_hooks';

import { createCancelablePromise } from '@opensumi/ide-utils/lib/async';
import { isPromiseCanceledError } from '@opensumi/ide-utils/lib/errors';
import mri from 'mri';

import { StopError, StopErrorWithReply } from './errors';
import { Registry } from './registry';
import { equalFunc, regex } from './rules';
import type {
  IRegexResolveResult,
  IResolveResult,
  IStarResolveResult,
  TStarHandler,
  THandler,
  TRegexHandler,
  TTextHandler,
  BaseContext,
  ICommand,
  RegexContext,
  TInterceptor,
} from './types';

interface InterceptorStore {
  interceptor: TInterceptor<any>;
}

const interceptorStorage = new AsyncLocalStorage<InterceptorStore>();

export interface ICommandCenterOptions<C> {
  prefix?: string[];
  replyText?: (c: C) => (text: string) => Promise<void>;
  timeout?: number;
}

export class CommandCenter<C extends Record<string, any>> {
  protected starHandlers: TStarHandler<C>[] = [];

  protected registry = new Registry<string, THandler<C>>();
  protected regexRegistry = new Registry<RegExp, THandler<C>>();

  protected prefixes = [] as string[];

  constructor(private options: ICommandCenterOptions<C> = {}) {
    this.prefixes = options.prefix ?? ['/'];
  }

  all(handler: TStarHandler<C>) {
    this.starHandlers.push(handler);
    return () => {
      this.starHandlers = this.starHandlers.filter((h) => h !== handler);
    };
  }

  on(pattern: RegExp, handler: TRegexHandler<C>): void;
  on(pattern: string, handler: TTextHandler<C>, alias?: string[]): void;
  on(pattern: string | RegExp, handler: THandler<C>, alias?: string[]) {
    const makeWrapper = (interceptor: TInterceptor<C>) => {
      return async (ctx: any, command: ICommand<any>) => {
        const result = await interceptor(ctx, command);
        if (result) {
          console.log('interceptor return true, stop executing handler');
          return;
        }
        await handler(ctx, command);
      };
    };

    let wrapper = handler;
    const interceptor = interceptorStorage.getStore();
    if (interceptor) {
      wrapper = makeWrapper(interceptor.interceptor);
    }

    if (pattern) {
      if (typeof pattern === 'string') {
        this.registry.add(pattern, wrapper, equalFunc);
        if (alias && Array.isArray(alias)) {
          for (const a of alias) {
            this.registry.add(a, wrapper, equalFunc);
          }
        }
      } else if (typeof pattern === 'object' && pattern instanceof RegExp) {
        this.regexRegistry.add(pattern, wrapper, regex);
      }
    }
  }

  async resolve(text: string): Promise<IResolveResult | undefined> {
    if (!text) {
      return;
    }

    let isCommand = false;
    let toResolve = text;
    let _prefix = '';
    for (const prefix of this.prefixes) {
      if (text.startsWith(prefix)) {
        toResolve = text.slice(prefix.length);
        _prefix = prefix;
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

    const { handler } = this.registry.find(toResolve) ?? {};

    const result = {
      type: 'text',
      command: toResolve,
      prefix: _prefix,
      handler,
    } as IResolveResult;

    if (!result.handler) {
      const tmp = this.regexRegistry.find(toResolve);
      if (tmp) {
        const { data, handler: regexHandler } = tmp;
        const regexResult = data.exec(toResolve)!;
        (result as IRegexResolveResult).type = 'regex';
        (result as IRegexResolveResult).regex = data;
        (result as IRegexResolveResult).result = regexResult;
        (result as IRegexResolveResult).handler = regexHandler;
      }
    }

    if (!result.handler && this.starHandlers.length > 0) {
      console.log(`${text} fallback to *`);
      (result as IStarResolveResult).type = 'star';
      (result as IStarResolveResult).handler = this.runStarHandlers.bind(this);
    }

    return result;
  }

  private async runStarHandlers(ctx: C & BaseContext, command: ICommand<any>) {
    await Promise.all(
      this.starHandlers.map((handler) => handler(ctx, command)),
    );
  }

  parseCommand<T extends Record<string, any>>(command: string) {
    const result = mri<T>(command.split(' '));
    result['_'] = result._.filter(Boolean);
    return {
      args: result,
      arg0: result._[0],
      argv: result._,
    };
  }

  async replyText(c: C, text: string) {
    await this.options?.replyText?.(c)(text);
  }

  async tryHandle(str: string, ctx: C, options?: { timeout?: number | null }) {
    // remove redundant \r\n
    str = str.trim();

    const args = this.parseCommand(str);

    const result = await this.resolve(args.arg0);

    if (result && result.handler) {
      const command: ICommand<any> = {
        ...args,
        raw: str,
        rawWithoutPrefix: str.slice(result.prefix.length),
        command: result.command,
      };

      (ctx as unknown as RegexContext).result = result as IRegexResolveResult;

      const p = createCancelablePromise(async (token) => {
        (ctx as unknown as BaseContext).token = token;
        return result.handler(ctx, command);
      });

      let timeoutToClear: ReturnType<typeof setTimeout> | undefined;
      const timeoutNumber = options?.timeout ?? this.options.timeout;
      if (typeof timeoutNumber === 'number') {
        console.log('command center timeout:', timeoutNumber);
        timeoutToClear = setTimeout(() => {
          p.cancel();
        }, timeoutNumber);
      }

      await p
        .then(() => {
          timeoutToClear && clearTimeout(timeoutToClear);
        })
        .catch(async (error) => {
          if (isPromiseCanceledError(error)) {
            await this.replyText(ctx, `executing [${str}] timeout`);
            return;
          }
          if (error instanceof StopError) {
            console.log('stop executing handler, reason:', error.message);
            return;
          }
          if (error instanceof StopErrorWithReply) {
            console.log(
              'stop executing handler with reply, reason:',
              error.message,
            );
            await this.replyText(ctx, error.message);
            return;
          }

          await this.replyText(
            ctx,
            `error when executing [${str}]: ${(error as Error).message}`,
          );
        });
    } else {
      console.log('no handler found for', str);
    }
  }

  help() {
    let text = '';
    const prefix = this.prefixes.filter(Boolean).join('、');
    if (prefix) {
      text += `前缀：${prefix}\n`;
    }

    text += '支持的命令：\n';

    this.registry.handlers.forEach(([key, [_, compareFunc]]) => {
      text += `- ${key}: ${compareFunc.displayName}\n`;
    });

    this.regexRegistry.handlers.forEach(([key, [_, compareFunc]]) => {
      text += `- ${key}: ${compareFunc.displayName}\n`;
    });
    if (this.starHandlers) {
      text += `- *: fallbackHandler\n`;
    }

    return text;
  }

  intercept(
    callback: () => Promise<void> | void,
    interceptor: TInterceptor<C>,
  ) {
    interceptorStorage.run(
      {
        interceptor,
      },
      callback,
    );
  }
}
