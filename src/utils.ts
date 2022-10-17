export class StringBuilder {
  private array = [] as string[];
  constructor(...initial: string[]) {
    this.array.push(...initial);
  }
  add(str: string, addExtraLine = false) {
    this.array.length > 0 && addExtraLine && this.array.push('');
    this.array.push(str);
    addExtraLine && this.array.push('');
  }
  build() {
    return '\n' + this.array.join('\n') + '\n';
  }
  toString() {
    return this.build();
  }
}

export function proxyThisUrl(env: Env, url: string) {
  return `${env.HOST}/proxy/${encodeURIComponent(url)}`;
}
