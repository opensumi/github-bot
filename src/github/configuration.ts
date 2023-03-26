import { ISetting } from '@/kv/types';

export default class Configuration {
  private constructor() {
    // noop
  }
  static #instance: Configuration;
  static instance() {
    if (!this.#instance) {
      this.#instance = new Configuration();
    }
    return this.#instance;
  }

  contentLimit = 300;

  static fromSettings(setting: ISetting) {
    const instance = this.instance();
    if (setting.contentLimit) {
      instance.contentLimit = setting.contentLimit;
    }
    return instance;
  }
}
