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
   * if there are content in the last line, then add a new line
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
