import { ERuleName } from '../gateway';
import favicon from '../public/favicon.svg';
import html from '../public/index.html';

import { ControllerFacade } from './base';
import * as Configuration from './configuration';
import * as Ding from './ding';
import * as GitHub from './github';
import * as Auth from './oauth';
import * as Proxy from './proxy';
import { OpenSumiRun, OpenSumiRunWithIDEPrefix } from './run';
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

const HealthEndpoint = {
  route: (hono: THono) => {
    hono.get('/health', (c) => {
      let uptime: number;

      if (
        typeof process !== 'undefined' &&
        typeof process.uptime === 'function'
      ) {
        uptime = process.uptime();
      } else if (
        typeof performance !== 'undefined' &&
        typeof performance.now === 'function'
      ) {
        uptime = performance.now();
      } else {
        uptime = -1;
      }
      return c.json({
        uptime,
        timestamp: Date.now(),
      });
    });
  },
};

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
    HealthEndpoint,
  ],
  [ERuleName.Run]: [
    OpenSumiRunWithIDEPrefix,
    OpenSumiRun,
    Auth,
    OpenSumiRunHome,
    HealthEndpoint,
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
