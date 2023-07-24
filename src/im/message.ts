import { standardizeMarkdown } from '@/github/utils';

export interface At {
  at: {
    atDingtalkIds: string[];
  };
}

export type Base<T extends string, O> = Record<T, O> & { msgtype: T };

export type Image = Base<
  'image',
  {
    picURL: string;
  }
>;

export type Markdown = Base<
  'markdown',
  {
    title: string;
    text: string;
  }
>;
export type Text = Base<
  'text',
  {
    content: string;
  }
>;

export type SendMessage = Image | Markdown | Text;

export function atDingtalkIds(...atDingtalkIds: string[]): At {
  return {
    at: {
      atDingtalkIds,
    },
  };
}

export function text(content: string): Text {
  return {
    msgtype: 'text',
    text: {
      content: content ? content.toString().trim() : '',
    },
  };
}

export function compose(...objects: any[]) {
  return Object.assign({}, ...objects);
}

export function markdown(title: string, text: string): Markdown {
  return {
    msgtype: 'markdown',
    markdown: {
      title,
      text: standardizeMarkdown(text),
    },
  };
}

export function image(url: string): Image {
  return {
    msgtype: 'image',
    image: { picURL: url },
  };
}

export function extension(extension: Record<string, unknown>) {
  return {
    msgtype: 'extension',
    extension,
  };
}

export function code(language: string, code: string) {
  return {
    ...extension({ text_type: 'code_snippet', code_language: language }),
    ...text(code),
  };
}
