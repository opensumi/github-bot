import { replaceGitHubText } from '@/github/gfm';
import { render } from '@/github/renderer';

export interface IBuildOptions {
  appendNewLineToTheEnd?: boolean;
}

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

  add(str: string) {
    this.array.push(str);
  }
  addDivider() {
    this.appendNewLineToTheEnd();
    this.add('***');
    this.appendNewLineToTheEnd();
  }
  /**
   * if there are content in the last line, then add a new line
   */
  appendNewLineToTheEnd() {
    const data = this.array[this.array.length - 1];
    if (data) {
      this.addLine();
    }
  }
  addLine() {
    this.array.push('');
  }
  build(options?: IBuildOptions) {
    if (options?.appendNewLineToTheEnd) {
      this.appendNewLineToTheEnd();
    }

    let newLines = this.array.map((v) => {
      if (v.trim()) {
        return v;
      }
      return '';
    });

    if (newLines.length > 1) {
      // 过滤掉连续的空行
      // 如果大于 1 行，则确保每一行被正确换行
      // 正确换行有两种形式：1. 该行有内容且该行以两个空格结尾，2. 该行与下一行之间有一个空行
      const finalLines = [] as string[];

      for (let i = 0; i < newLines.length; i++) {
        const line = newLines[i];
        const isLastLine = i === newLines.length - 1;
        const nextLine = newLines[i + 1];
        if (line) {
          if (nextLine) {
            // 当前行和下一行都有内容
            finalLines.push(ensureEndsWithTwoSpaces(line));
          } else {
            // 当前行有内容，但下一行为空行
            finalLines.push(line);
          }
        } else {
          // 当前行为空行
          if (nextLine) {
            // 当前行为空行，下一行有内容
            finalLines.push(line);
          } else {
            // 当前行和下一行都为空行
            if (isLastLine) {
              // 最后一行为空行
              finalLines.push(line);
            }
          }
        }
      }

      newLines = finalLines;
    }

    return replaceGitHubText(newLines.join('\n'));
  }
  toString() {
    return this.build();
  }

  render(payload: any, options?: IBuildOptions) {
    return replaceGitHubText(render(this.build(options), payload));
  }
}

export function limitTextByPosition(
  text: string,
  position: number,
  minLine = 6,
) {
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

  // 如果 limit 过后的行数小于 minLine, 则使用 minLine
  lineNo = lineNo < minLine ? minLine : lineNo;

  return limitLine(text, lineNo);
}

export function limitLine(
  text: string,
  count: number,
  start = 0,
  lineProcess = (v: string) => v,
) {
  const arrayOfLines = text.replace(/\r\n|\n\r|\n|\r/g, '\n').split('\n');
  const finalLines = arrayOfLines
    .slice(start, start + count)
    .map((v) => lineProcess(v));
  return finalLines.join('\n').trim();
}

export function getFirstLineAndRest(text: string) {
  const arrayOfLines = text.replace(/\r\n|\n\r|\n|\r/g, '\n').split('\n');
  const firstLine = arrayOfLines[0];
  const rest = arrayOfLines.slice(1).join('\n');
  return { firstLine, rest };
}

export function splitByLine(text: string) {
  return text.replace(/\r\n|\n\r|\n|\r/g, '\n').split('\n');
}

export function ensureEndsWithTwoSpaces(text: string) {
  return text.endsWith('  ') ? text : text + '  ';
}
