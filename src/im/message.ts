import { standardizeMarkdown } from '@/github/utils';
import { Markdown } from '@opensumi/dingtalk-bot/lib/types';

// export * from '@opensumi/dingtalk-bot/lib/types';

export function markdown(title: string, text: string): Markdown {
  return {
    msgtype: 'markdown',
    markdown: {
      title,
      text: standardizeMarkdown(text),
    },
  };
}
