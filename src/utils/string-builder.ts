import { render } from '@/github/renderer';
import { makeMarkdown, parseMarkdown, walk } from '@/github/renderer/make-mark';
import { replaceGitHubText } from '@/github/utils';

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
    this.add(prefix + '***', addExtraLine);
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
    return replaceGitHubText(this.array.join('\n'));
  }
  toString() {
    return this.build();
  }

  render(payload: any) {
    return replaceGitHubText(render(this.build(), payload));
  }
}

const LIMIT_MIN_LINE = 5;

export function tryReplaceImageToNull(text: string) {
  text = replaceGitHubText(text);

  const ast = parseMarkdown(text);

  let imageCount = 0;

  walk(ast, (node) => {
    if (node.type === 'image') {
      imageCount++;
      node.url = '';
      node.alt = '';
      node.title = '';
      return true;
    }
  });

  const result = makeMarkdown(ast);

  return { result, imageCount };
}

export function limitTextByPosition(text: string, position: number) {
  // replace all image url to null
  const { result, imageCount } = tryReplaceImageToNull(text);

  // if images count less than 8, we only process the non-image text
  if (imageCount < 8) {
    text = result;
  }

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
