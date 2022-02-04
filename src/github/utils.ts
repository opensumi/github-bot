import { send } from '@/ding/utils';
import secrets from '@/secrets';
export async function sendToDing(title: string, text: string) {
  if (!secrets.dingtalkWebhookUrl) {
    return;
  }
  const dingContent = {
    msgtype: 'markdown',
    markdown: {
      title,
      text,
    },
  };

  await send(dingContent, secrets.dingtalkWebhookUrl, secrets.dingtalkSecret);
}
