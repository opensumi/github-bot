import * as Ding from './ding';
import * as GitHub from './github';
import * as Proxy from './proxy';
import * as Static from './static';
import * as Webhook from './webhook';

export const registerBlueprint = (hono: THono) => {
  Ding.route(hono);
  GitHub.route(hono);
  Proxy.route(hono);
  Webhook.route(hono);
  Static.route(hono);
};
