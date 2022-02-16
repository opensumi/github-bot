import { send } from '@/ding/utils';
import { DingSecret } from '@/secrets';

export async function sendToDing(
  title: string,
  text: string,
  secret: DingSecret,
) {
  if (!secret.webhook) {
    return;
  }
  const dingContent = {
    msgtype: 'markdown',
    markdown: {
      title,
      text,
    },
  };

  await send(dingContent, secret.webhook, secret.secret);
}
