import favicon from '../../public/favicon.svg';
import html from '../../public/index.html';
import { ERuleName } from '../gateway';

import { ControllerFacade } from './base';
import * as Configuration from './configuration';
import * as Ding from './ding';
import * as GitHub from './github';
import * as Auth from './oauth';
import * as Proxy from './proxy';
import { OpenSumiRunWithIDEPrefix, OpenSumiRun } from './run';
import * as Static from './static';
import * as Webhook from './webhook';

const SimpleHome = {
  route: (hono: THono) => {
    hono.get('/', (c) => c.html(html));
  },
};

const OpenSumiRunHome = {
  route: (hono: THono) => {
    hono.get('/', (c) => {
      return c.redirect('/opensumi/core');
    });
  },
};

const githubBotControllers = [
  SimpleHome,
  Ding,
  GitHub,
  Proxy,
  Webhook,
  Static,
  Configuration,
  Auth,
] as ControllerFacade[];

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
  '': githubBotControllers,
  [ERuleName.Run]: [
    OpenSumiRunWithIDEPrefix,
    OpenSumiRun,
    Auth,
    OpenSumiRunHome,
  ],
} as Record<ERuleName, ControllerFacade[]>;

function applyControllers(hono: THono, controllers: ControllerFacade[]) {
  applyBaseController(hono);

  controllers.forEach((controller) => {
    controller.route(hono);
  });
}

export const registerControllers = (hono: THono) => {
  Object.entries(controllers).forEach(([basePath, controllers]) => {
    const blueprint = hono.basePath(basePath);
    applyControllers(blueprint, controllers);
  });
};
