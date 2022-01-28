export async function sign(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const secretKeyData = encoder.encode(DINGTALK_SECRET);
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
  let signStr = '';
  if (DINGTALK_SECRET) {
    const timestamp = Date.now();
    signStr =
      '&timestamp=' +
      timestamp +
      '&sign=' +
      sign(timestamp + '\n' + DINGTALK_SECRET);
  }

  await fetch(DINGTALK_WEBHOOK_URL + signStr, {
    body: JSON.stringify(dingContent),
    method: 'POST',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });
}
