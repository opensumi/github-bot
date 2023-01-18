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
  addDivider(prefix = '') {
    this.add(prefix + '---');
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
    // 如果有连续两行以上的空行，移除掉一个
    return '\n' + this.array.join('\n') + '\n';
  }
  toString() {
    return this.build();
  }
}

export function proxyThisUrl(env: Env, url: string) {
  return `${env.HOST}/proxy/${encodeURIComponent(url)}`;
}
