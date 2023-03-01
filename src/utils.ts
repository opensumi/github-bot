export class StringBuilder {
  private array = [] as string[];
  constructor(...initial: string[]) {
    this.array.push(...initial);
  }
  add(str: string, addExtraLine = false) {
    addExtraLine && this.addLineIfNecessary();
    this.array.push(str);
    addExtraLine && this.addLineIfNecessary();
  }
  addDivider(prefix = '', addExtraLine = false) {
    this.add(prefix + '---', addExtraLine);
  }
  /**
   * 如果当前的最后一行有文字才换行
   */
  addLineIfNecessary() {
    const data = this.array[this.array.length - 1];
    if (data) {
      this.array.push('');
    }
  }
  build() {
    return this.array.join('\n');
  }
  toString() {
    return this.build();
  }
}

export function proxyThisUrl(env: IRuntimeEnv, url: string) {
  return `${env.HOST}/proxy/${encodeURIComponent(url)}`;
}

export function randomChoice(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function errorCallback(
  promise: Promise<void>,
  cb: (err: unknown) => void,
) {
  try {
    await promise;
  } catch (err) {
    cb(err);
    throw err;
  }
}
