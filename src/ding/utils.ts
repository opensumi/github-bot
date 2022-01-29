export async function doSign(secret: string, content: string): Promise<string> {
  const encoder = new TextEncoder();
  const secretKeyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    secretKeyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(content));

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
  console.log('发送结果：', await resp.text());
  return resp;
}
