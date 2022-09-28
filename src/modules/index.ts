import { DingController } from './ding/ding.controller';
import { GitHubController } from './github/github.controller';
import { WebhookController } from './webhook/webhook.controller';
import { ProxyController } from './proxy/proxy.controller';

export function ignition(hono: THono) {
  new DingController(hono);
  new GitHubController(hono);
  new WebhookController(hono);
  new ProxyController(hono);
}
