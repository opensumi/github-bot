export interface At {
  at: {
    atDingtalkIds: string[];
  };
}

export interface Text {
  msgtype: 'text';
  text: {
    content: string;
  };
}

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
      content,
    },
  };
}

export function compose(...objects: any[]) {
  return Object.assign({}, ...objects);
}

export interface Markdown {
  msgtype: 'markdown';
  markdown: {
    title: string;
    text: string;
  };
}

export function markdown(title: string, text: string): Markdown {
  return {
    msgtype: 'markdown',
    markdown: {
      title,
      text,
    },
  };
}
