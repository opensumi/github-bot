export default class Environment {
  private constructor() {
    // noop
  }
  static #instance: Environment;

  get KV_PROD() {
    return this.env.KV_PROD;
  }

  get CHATGPT_API_REVERSE_PROXY_URL() {
    return this.env.CHATGPT_API_REVERSE_PROXY_URL;
  }
  get CHATGPT_ENDPOINT() {
    return this.env.CHATGPT_ENDPOINT;
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
