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

export function proxyThisUrl(origin: string, url: string) {
  return `${origin}/proxy/${encodeURIComponent(url)}`;
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

// format Date to "yyyy-mm-dd" style
export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};
