import { BaseController } from './base/base.controller';
import { DingController } from './ding/ding.controller';
import { GitHubController } from './github/github.controller';
import { ProxyController } from './proxy/proxy.controller';
import { WebhookController } from './webhook/webhook.controller';

export function ignition(hono: THono) {
  const modules = [
    DingController,
    GitHubController,
    WebhookController,
    ProxyController,
  ] as typeof BaseController[];

  const instances = modules.map((M) => {
    const instance = new M(hono);
    return instance;
  });

  return instances;
}
