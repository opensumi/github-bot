export type TSupportedRuntime = 'cloudflare' | 'node';

export default class Environment {
  private constructor(
    public readonly runtime: TSupportedRuntime,
    private env: IRuntimeEnv,
  ) {}

  static #instance: Environment;

  get KV() {
    return this.env.KV_PROD;
  }

  get HOST() {
    return this.env.HOST;
  }

  get OPENAI_API_KEY() {
    return this.env.OPENAI_API_KEY;
  }

  get OPENAI_ACCESS_TOKEN() {
    return this.env.OPENAI_ACCESS_TOKEN;
  }

  get CHATGPT_API_REVERSE_PROXY_URL() {
    return this.env.CHATGPT_API_REVERSE_PROXY_URL;
  }

  static instance() {
    if (!this.#instance) {
      throw new Error('Environment not initialized');
    }
    return this.#instance;
  }

  static from(runtime: TSupportedRuntime, env: IRuntimeEnv) {
    if (this.#instance) {
      throw new Error('Environment already initialized');
    }
    const instance = new Environment(runtime, env);

    this.#instance = instance;
    return instance;
  }
}
