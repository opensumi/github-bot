export type TSupportedRuntime = 'cfworker' | 'node';

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

  static instance() {
    if (!this.#instance) {
      throw new Error('Environment not initialized');
    }
    return this.#instance;
  }

  static from(runtime: TSupportedRuntime, env: IRuntimeEnv) {
    if (this.#instance) {
      return this.#instance;
    }
    const instance = new Environment(runtime, env);

    this.#instance = instance;
    return instance;
  }
}
