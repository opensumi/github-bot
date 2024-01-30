import { EdgeKVNamespace } from 'edge-mock';

import Environment from '@/env';
import { GitHubCommon } from '@/kv/constants';

export function prepareEnv() {
  const kv = new EdgeKVNamespace();
  Environment.from('node', {
    KV: kv,
    MESSAGE_QUEUE: {} as any,
  });

  kv.put(
    `${GitHubCommon.GITHUB_APP_SETTINGS_PREFIX}mock`,
    JSON.stringify({
      appSettings: {
        appId: process.env.GITHUB_APPID,
        privateKey: process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      },
      githubSecret: process.env.GITHUB_TOKEN,
      dingWebhooks: [],
      contentLimit: 300,
    }),
  );
}
