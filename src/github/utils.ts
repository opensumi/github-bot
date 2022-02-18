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
  if (secret.contentLimit && secret.contentLimit > 0) {
    text = text.slice(0, secret.contentLimit);
  }

  const dingContent = {
    msgtype: 'markdown',
    markdown: {
      title,
      text,
    },
  };
  const toPromise = [] as Promise<void>[];

  for (const webhook of secret.dingWebhooks) {
    toPromise.push(
      (async () => {
        console.log('send to ', webhook.url);
        await send(dingContent, webhook.url, webhook.secret);
      })(),
    );
  }
  await Promise.all(toPromise);
}
