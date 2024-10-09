import { saftParseInt } from './utils/number';

export interface IEnvironmentConfig {
  defaultTimeout: number;
}

export default class Environment {
  private constructor(
    public readonly config: IEnvironmentConfig,
    private env: IRuntimeEnv,
  ) {
    this._timeout = config.defaultTimeout;

    if (env.TIMEOUT) {
      const timeout = saftParseInt(env.TIMEOUT);
      if (typeof timeout !== 'undefined') {
        this._timeout = timeout;
      }
    }
  }

  static #instance: Environment | null;

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

  static instance() {
    if (!this.#instance) {
      throw new Error('Environment is not initialized');
    }
    return this.#instance;
  }

  static initialize(runtimeConfig: IEnvironmentConfig, env: IRuntimeEnv) {
    this.#instance = new Environment(runtimeConfig, env);
  }

  static dispose() {
    this.#instance = null;
  }
}
