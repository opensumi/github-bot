import { IRuntimeConfig } from './runtime/base';
import { parseValidNumber } from './utils/number';

export default class Environment {
  private constructor(
    public readonly runtimeConfig: IRuntimeConfig,
    private env: IRuntimeEnv,
  ) {
    this._timeout = runtimeConfig.defaultTimeout;

    if (env.TIMEOUT) {
      const timeout = parseValidNumber(env.TIMEOUT);
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

  get metrics() {
    return this.env.metricsDataset!;
  }

  get OPENAI_API_KEY() {
    return this.env.OPENAI_API_KEY;
  }

  private _timeout: number | null = null;

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

  static initialize(runtimeConfig: IRuntimeConfig, env: IRuntimeEnv) {
    this.#instance = new Environment(runtimeConfig, env);
  }

  static dispose() {
    this.#instance = null;
  }
}
