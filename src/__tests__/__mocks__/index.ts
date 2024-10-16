import { GitHubCommon } from '@/dal/constants';
import Environment from '@/env';
import { runtimeConfig } from '@/runtime/node/config';
import { LocalKV } from '@/runtime/node/kv';

const githubSecret = process.env.GITHUB_TOKEN || 'mock-secret';
const githubAppId = process.env.GITHUB_APPID || 'mock-app-id';
const githubPrivateKey =
  process.env.GITHUB_APP_PRIVATE_KEY || 'mock-private-key';

export async function prepareEnv() {
  const kv = new LocalKV();
  const e = Environment.from(runtimeConfig, {
    KV: kv,
    MESSAGE_QUEUE: {} as any,
    ENVIRONMENT: 'unittest',
  });

  await e.run(async () => {
    await kv.put(
      `${GitHubCommon.GITHUB_APP_SETTINGS_PREFIX}mock`,
      JSON.stringify({
        appSettings: {
          appId: githubAppId,
          privateKey: githubPrivateKey!.replace(/\\n/g, '\n'),
        },
        githubSecret,
        dingWebhooks: [],
        contentLimit: 300,
      }),
    );
    console.log('prepare env done');
    console.log(
      'app settings',
      await kv.get(`${GitHubCommon.GITHUB_APP_SETTINGS_PREFIX}mock`),
    );
  });

  return e;
}
