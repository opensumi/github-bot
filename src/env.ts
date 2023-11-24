export type TSupportedRuntime = 'cfworker' | 'node' | 'node-wechaty';

export default class Environment {
  private constructor(
    public readonly runtime: TSupportedRuntime,
    private env: IRuntimeEnv,
  ) {}

  static #instance: Environment | null;

  useQueue = false;

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

  static instance() {
    if (!this.#instance) {
      throw new Error('Environment is not initialized');
    }
    return this.#instance;
  }

  static from(runtime: TSupportedRuntime, env: IRuntimeEnv) {
    if (this.#instance) {
      return this.#instance;
    }
    const instance = new Environment(runtime, env);

    if (runtime === 'cfworker') {
      // cloudflare worker 会在 30s 后强制结束 worker，所以这里设置 29s 的超时
      instance._timeout = 29 * 1000;
    }

    if (env.TIMEOUT) {
      const timeout = parseInt(env.TIMEOUT, 10);
      if (!isNaN(timeout)) {
        instance._timeout = timeout;
      }
    }

    this.#instance = instance;
    return instance;
  }

  static dispose() {
    this.#instance = null;
  }
}
