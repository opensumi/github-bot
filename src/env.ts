import { AsyncLocalStorage } from 'node:async_hooks';
import { saftParseInt } from './utils/number';
import { getHostOrigin } from './utils/req';

export interface IEnvironmentConfig {
  defaultTimeout: number;
}

export const als = new AsyncLocalStorage<Environment>();

export const getEnvironment = () => als.getStore()!;

export interface IExtraEnv {
  origin: string;
}

export default class Environment {
  origin: string;

  private constructor(
    public readonly config: IEnvironmentConfig,
    private env: IRuntimeEnv,
    extraEnv: IExtraEnv,
  ) {
    this._timeout = config.defaultTimeout;
    this.origin = extraEnv.origin;
    if (env.TIMEOUT) {
      const timeout = saftParseInt(env.TIMEOUT);
      if (typeof timeout !== 'undefined') {
        this._timeout = timeout;
      }
    }
  }

  get Queue() {
    return this.env.MESSAGE_QUEUE;
  }

  get KV() {
    return this.env.KV;
  }

  get OPENAI_API_KEY() {
    return this.env.OPENAI_API_KEY;
  }

  private _timeout: number | undefined = undefined;

  get timeout() {
    return this._timeout;
  }

  get environment() {
    return this.env.ENVIRONMENT;
  }

  get supportProxy() {
    return Boolean(this.origin);
  }

  getProxiedUrl = (url: string) => {
    return `${this.origin}/proxy/${encodeURIComponent(url)}`;
  };

  public run<R, TArgs extends any[]>(
    callback: (...args: TArgs) => R,
    ...args: TArgs
  ): R {
    return als.run(this, callback, ...args);
  }

  static from(
    runtimeConfig: IEnvironmentConfig,
    env: IRuntimeEnv,
    extraEnv?: IExtraEnv,
  ) {
    return new Environment(
      runtimeConfig,
      env,
      extraEnv || {
        origin: '',
      },
    );
  }
}
