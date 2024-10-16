import { ERuleName } from '../gateway';
import favicon from '../public/favicon.svg';

import * as Admin from './admin';
import { ControllerFacade } from './base';
import * as Configuration from './configuration';
import * as Ding from './ding';
import * as GitHub from './github';
import * as Health from './health';
import * as SimpleHome from './home';
import * as Auth from './oauth';
import * as Proxy from './proxy';
import { OpenSumiRun, OpenSumiRunWithIDEPrefix } from './run';
import * as OpenSumiRunHome from './run/home';
import * as Static from './static';
import * as Webhook from './webhook';

const applyBaseController = (hono: THono) => {
  hono.get('/favicon.ico', async (c) => {
    return c.body(favicon, 200, {
      'content-type': 'image/svg+xml',
    });
  });

  hono.get('/robots.txt', async (c) => {
    return c.text('User-agent: *\nDisallow: /', 200);
  });
};

const controllers = {
  '': [
    SimpleHome,
    Ding,
    GitHub,
    Proxy,
    Webhook,
    Static,
    Configuration,
    Auth,
    Health,
    Admin,
  ],
  [ERuleName.Run]: [
    OpenSumiRunWithIDEPrefix,
    OpenSumiRun,
    Auth,
    OpenSumiRunHome,
    Health,
  ],
} as Record<ERuleName, ControllerFacade[]>;

function applyChildControllers(hono: THono, controllers: ControllerFacade[]) {
  applyBaseController(hono);

  controllers.forEach((controller) => {
    controller.route(hono);
  });
}

export const applyControllers = (hono: THono) => {
  Object.entries(controllers).forEach(([basePath, _controllers]) => {
    const domain = hono.basePath(basePath);
    applyChildControllers(domain, _controllers);
  });
};
