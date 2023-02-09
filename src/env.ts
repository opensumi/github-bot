export default class Environment {
  private constructor() {
    // noop
  }
  static #instance: Environment;

  get KV_PROD() {
    return this.env.KV_PROD;
  }

  static instance() {
    if (!this.#instance) {
      this.#instance = new Environment();
    }
    return this.#instance;
  }

  env!: IRuntimeEnv;
  static from(env: IRuntimeEnv) {
    const instance = this.instance();
    instance.env = env;
    return instance;
  }
}
