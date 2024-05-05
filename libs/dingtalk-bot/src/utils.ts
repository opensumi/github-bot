import { sign } from '@opensumi/workers-utils/lib/crypto';
import { DWClient } from 'dingtalk-stream/client';

export async function doSign(secret: string, content: string): Promise<string> {
  const mac = await sign(secret, content);

  // `mac` is an ArrayBuffer, so we need to jump through a couple of hoops to get
  // it into a ByteString, and then a Base64-encoded string.
  const base64Mac = btoa(String.fromCharCode(...new Uint8Array(mac)));
  return encodeURIComponent(base64Mac);
}

/**
 * https://open.dingtalk.com/document/group/push-message
 * https://open.dingtalk.com/document/group/custom-robot-access
 * @param dingContent
 * @param webhookUrl
 * @param secret
 * @returns
 */
export async function send(
  dingContent: any,
  webhookUrl: string,
  secret?: string,
) {
  if (!webhookUrl) {
    return;
  }

  let signStr = '';
  if (secret) {
    const timestamp = Date.now();
    signStr =
      '&timestamp=' +
      timestamp +
      '&sign=' +
      (await doSign(secret, timestamp + '\n' + secret));
  }

  const resp = await fetch(webhookUrl + signStr, {
    body: JSON.stringify(dingContent),
    method: 'POST',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });
  console.log('response:', await resp.text());
  return resp;
}

export async function sendFromClient(
  client: DWClient,
  messageId: string,
  webhookUrl: string,
  dingContent: any,
) {
  const accessToken = await client.getAccessToken();

  const resp = await fetch(webhookUrl, {
    body: JSON.stringify(dingContent),
    method: 'POST',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      'x-acs-dingtalk-access-token': accessToken,
    },
  });

  const data = await resp.json();

  // stream模式下，服务端推送消息到client后，会监听client响应，如果消息长时间未响应会在一定时间内(60s)重试推消息，可以通过此方法返回消息响应，避免多次接收服务端消息。
  // 机器人topic，可以通过socketCallBackResponse方法返回消息响应
  client.socketCallBackResponse(messageId, data);
}
