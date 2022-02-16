import { send } from '@/ding/utils';
import { DingSecret } from '@/secrets';

export async function sendToDing(
  title: string,
  text: string,
  secret: DingSecret,
) {
  if (secret.dingWebhooks.length === 0) {
    return;
  }
  const dingContent = {
    msgtype: 'markdown',
    markdown: {
      title,
      text,
    },
  };
  const toPromise = [] as (() => Promise<void>)[];

  for (const webhook of secret.dingWebhooks) {
    toPromise.push(async () => {
      await send(dingContent, webhook.url, webhook.secret);
    });
  }
  await Promise.all(toPromise);
}
