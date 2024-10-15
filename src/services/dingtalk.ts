import { EmitterWebhookEventName } from '@octokit/webhooks';

import { ISetting } from '@/dal/types';
import {
  IMakeMarkdownOptions,
  standardizeMarkdown,
} from '@/services/github/renderer/make-mark';
import { limitTextByPosition } from '@/utils';
import {
  Markdown,
  markdown as _markdown,
} from '@opensumi/dingtalk-bot/lib/types';
import { send } from '@opensumi/dingtalk-bot/lib/utils';

import { context } from '@/middleware/async-local-storage';
import { MarkdownContent } from './github/types';

function dingSecurityInterception(text: string) {
  text = text.replaceAll('dingtalk://dingtalkclient/page/link?url=', '');
  return text;
}

export class DingtalkService {
  private static _instance: DingtalkService | undefined;
  static instance() {
    if (!this._instance) {
      this._instance = new DingtalkService();
    }

    return this._instance;
  }

  private constructor() {}

  async sendContentToDing(
    dingContent: Record<string, unknown>,
    eventName: EmitterWebhookEventName,
    setting: ISetting,
  ) {
    if (setting.dingWebhooks.length === 0) {
      return;
    }

    const promises = [] as Promise<void>[];

    for (const webhook of setting.dingWebhooks) {
      console.log(`webhook`, webhook);
      if (webhook.event && webhook.event.length > 0) {
        // 如果 webhook 设置了只接受的 event，查询一下
        if (!webhook.event.includes(eventName)) {
          // 如果这个 webhook 不接收本次 event，就跳过
          continue;
        }
      }

      promises.push(
        (async () => {
          console.log('send to ', webhook.url);
          await send(dingContent, webhook.url, webhook.secret);
        })(),
      );
    }
    await Promise.allSettled(promises);
  }
  async sendToDing(
    data: MarkdownContent,
    eventName: EmitterWebhookEventName,
    setting: ISetting,
  ) {
    if (!setting.dingWebhooks || setting.dingWebhooks.length === 0) {
      console.error('no ding webhook setting, please check');
      return;
    }

    const dingContent = this.convertToDingMarkdown(
      data.title,
      data.text,
      this.createImageProxy(),
    );

    await this.sendContentToDing(dingContent, eventName, setting);
  }

  /**
   * 钉钉最大 5000 字
   */
  convertToDingMarkdown(
    title: string,
    text: string,
    options?: IMakeMarkdownOptions,
  ): Markdown {
    text = dingSecurityInterception(text);
    text = limitTextByPosition(text, 5000 - title.length - 10);
    return _markdown(title, standardizeMarkdown(text, options));
  }
  createImageProxy = () => {
    return {
      handleImageUrl: (url: string) => {
        try {
          return context().getProxiedUrl(url);
        } catch {
          return url;
        }
      },
    };
  };
}
