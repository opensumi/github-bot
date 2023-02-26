export default class Environment {
  private constructor() {
    // noop
  }
  static #instance: Environment;

  get KV_PROD() {
    return this.env.KV_PROD;
  }

  get OPENAI_ACCESS_TOKEN() {
    return this.env.OPENAI_ACCESS_TOKEN;
  }

  get CHATGPT_API_REVERSE_PROXY_URL() {
    return this.env.CHATGPT_API_REVERSE_PROXY_URL;
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
