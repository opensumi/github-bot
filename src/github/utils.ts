import { send } from '@/ding/utils';

export async function sendToDing(title: string, text: string) {
  // 也许没有设置环境变量
  if (!DINGTALK_WEBHOOK_URL) {
    return;
  }
  const dingContent = {
    msgtype: 'markdown',
    markdown: {
      title,
      text,
    },
  };

  await send(dingContent, DINGTALK_WEBHOOK_URL, DINGTALK_SECRET);
}
