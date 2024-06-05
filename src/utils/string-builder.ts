import { replaceGitHubText } from '@/github/gfm';
import { render } from '@/github/renderer';
import { makeMarkdown, parseMarkdown, walk } from '@/github/renderer/make-mark';

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
    this.appendEmptyLine();
    this.add('---');
    this.appendEmptyLine();
  }
  /**
   * if there are content in the last line, then add a new line
   */
  appendEmptyLine() {
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

/**
 * remove image url and alt text,
 * remove heading
 * remove code block
 */
export function transformMarkdownToLimitable(text: string) {
  text = replaceGitHubText(text);

  const ast = parseMarkdown(text);

  let imageCount = 0;
  let headingDepthCount = 0;

  walk(ast, (node) => {
    if (node.type === 'image') {
      imageCount++;
      node.url = '';
      node.alt = '';
      node.title = '';
      return true;
    } else if (node.type === 'code') {
      (node as any).type = 'text';
      node.lang = '';
      node.meta = '';
      return true;
    } else if (node.type === 'heading') {
      headingDepthCount = headingDepthCount + node.depth;
    }
  });

  const result = makeMarkdown(ast);

  return { result, imageCount, headingDepthCount };
}

export function limitTextByPosition(
  text: string,
  position: number,
  minLine = 6,
) {
  // replace all image url to null
  const { result, imageCount, headingDepthCount } =
    transformMarkdownToLimitable(text);

  // if images count less than 8, we only process the non-image text
  if (imageCount < 8) {
    text = result;
    // tolerate heading depth
    position = position + headingDepthCount;
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

  // 如果 limit 过后的行数小于 minLine, 则使用 minLine
  lineNo = lineNo < minLine ? minLine : lineNo;

  const finalLines = arrayOfLines.slice(0, lineNo);
  let finalContent = finalLines.join('\n').trim();
  if (lineNo < arrayOfLines.length) {
    finalContent = finalContent + '\n...';
  }
  return finalContent;
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
