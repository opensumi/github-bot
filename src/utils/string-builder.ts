import { render } from '@/github/renderer';

export class StringBuilder {
  private array = [] as string[];
  constructor(...initial: string[]) {
    this.array.push(...initial);
  }

  addNoNewLine(str: string) {
    const last = this.array[this.array.length - 1];
    if (last) {
      this.array[this.array.length - 1] = last + str;
    } else {
      this.array.push(str);
    }
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
  addLine() {
    this.array.push('');
  }
  build() {
    return this.array.join('\n');
  }
  toString() {
    return this.build();
  }

  render(
    payload: any,
    options?: {
      contentLimit?: number;
    },
  ) {
    const result = render(this.build(), payload);

    if (options?.contentLimit && options.contentLimit > 0) {
      return limitTextByPosition(result, options.contentLimit);
    }

    return result;
  }
}

const LIMIT_MIN_LINE = 5;

export function limitTextByPosition(text: string, position: number) {
  const arrayOfLines = text.replace(/\r\n|\n\r|\n|\r/g, '\n').split('\n');

  let count = 0;
  let lineNo = 0;
  for (; lineNo < arrayOfLines.length; lineNo++) {
    const line = arrayOfLines[lineNo];
    count += line.length;
    if (count >= position) {
      break;
    }
  }

  lineNo++;

  // 如果 limit 过后的行数小于 LIMIT_MIN_LINE，则使用 LIMIT_MIN_LINE
  lineNo = lineNo < LIMIT_MIN_LINE ? LIMIT_MIN_LINE : lineNo;

  const finalLines = arrayOfLines.slice(0, lineNo);
  let finalContent = finalLines.join('\n').trim();
  if (lineNo < arrayOfLines.length) {
    finalContent = finalContent + '...';
  }
  return finalContent;
}
