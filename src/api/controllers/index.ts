import * as Configuration from './configuration';
import * as Ding from './ding';
import * as GitHub from './github';
import * as Auth from './oauth';
import * as Proxy from './proxy';
import * as OpenSumiRun from './run';
import * as Static from './static';
import * as Webhook from './webhook';

export const registerControllers = (hono: THono) => {
  Ding.route(hono);
  GitHub.route(hono);
  Proxy.route(hono);
  Webhook.route(hono);
  Static.route(hono);
  Configuration.route(hono);
  Auth.route(hono);

  const opensumiRun = hono.basePath('/run');
  OpenSumiRun.route(opensumiRun);
  Auth.route(opensumiRun);
};
