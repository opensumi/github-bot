import { fromMarkdown } from 'mdast-util-from-markdown';
import { Content, Parent } from 'mdast-util-from-markdown/lib/index';
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm';
import { toMarkdown } from 'mdast-util-to-markdown';
import { gfm } from 'micromark-extension-gfm';

export function parseMarkdown(text: string) {
  const tree = fromMarkdown(trimLeadingWhiteSpace(text), {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  return tree;
}

function trimLeadingWhiteSpace(str: string) {
  /*
    Get the initial indentation
    But ignore new line characters
  */
  const matcher = /^[\r\n]?(\s+)/;
  if (matcher.test(str)) {
    /*
      Replace the initial whitespace 
      globally and over multiple lines
    */
    return str.replace(new RegExp('^' + str.match(matcher)![1], 'gm'), '');
  } else {
    // Regex doesn't match so return the original string
    return str;
  }
}

export function walk(root: Parent, cb: (token: Content) => boolean | void) {
  root.children.forEach((node) => {
    if (node) {
      const skip = cb(node);
      if (!skip) {
        if ((node as Parent).children) {
          walk(node as Parent, cb);
        }
      }
    }
  });
}

export function makeMarkdown(tree: Parent) {
  return toMarkdown(tree, {
    extensions: [gfmToMarkdown()],
    listItemIndent: 'one',
    rule: '-',
    fence: '`',
    handlers: {
      // remove the image alt text
      image: (node) => {
        return `![](${node.url})`;
      },
    },
    fences: true,
  });
}

export function standardizeMarkdown(text: string) {
  const tree = parseMarkdown(text);
  return makeMarkdown(tree);
}
