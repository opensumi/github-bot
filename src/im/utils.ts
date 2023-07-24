import { sign } from '@/runtime/cfworker/crypto';

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
