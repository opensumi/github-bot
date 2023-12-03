import { standardizeMarkdown } from '@/github/utils';
import {
  Markdown,
  markdown as _markdown,
} from '@opensumi/dingtalk-bot/lib/types';

export function markdown(title: string, text: string): Markdown {
  return _markdown(title, standardizeMarkdown(text));
}
