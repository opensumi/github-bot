import { SupportedUpstreams } from '../gateway';

import * as Configuration from './configuration';
import * as Ding from './ding';
import * as GitHub from './github';
import * as Auth from './oauth';
import * as Proxy from './proxy';
import * as OpenSumiRun from './run';
import * as Static from './static';
import * as Webhook from './webhook';

interface ControllerFacade {
  route(hono: THono): void;
}

const defaultControllers = [
  Ding,
  GitHub,
  Proxy,
  Webhook,
  Static,
  Configuration,
  Auth,
] as ControllerFacade[];

const domainSpecificControllers = {
  [SupportedUpstreams.Run]: [OpenSumiRun, Auth],
} as Record<SupportedUpstreams, ControllerFacade[]>;

function applyControllers(hono: THono, controllers: ControllerFacade[]) {
  controllers.forEach((controller) => {
    controller.route(hono);
  });
}

export const registerControllers = (hono: THono) => {
  applyControllers(hono, defaultControllers);

  Object.entries(domainSpecificControllers).forEach(
    ([basePath, controllers]) => {
      const blueprint = hono.basePath(basePath);
      applyControllers(blueprint, controllers);
    },
  );
};
