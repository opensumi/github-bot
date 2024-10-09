import { html } from 'hono/html';

import { OpenSumiRunKVManager } from '@/dao/run';
import Environment from '@/env';

import { ControllerFacade } from './base';

function registerOpenSumiRun(hono: THono, prefix = '') {
  hono.get(`${prefix}/:group/:project`, async (c) => {
    const env = Environment.instance().environment;
    const kvManager = OpenSumiRunKVManager.instance();

    const config = await kvManager.getCdnConfig();
    const originTrial = await kvManager.getTrialToken(env);

    return c.html(
      html`<!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>OpenSumi</title>
            <link
              rel="icon"
              href="https://opensumi.com/favicon-32x32.png?v=844070368776e5e9503bdeccf498ee66"
            />
            <script src="https://g.alicdn.com/code/lib/??react/16.14.0/umd/react.production.min.js,react-dom/16.14.0/umd/react-dom.production.min.js"></script>
            <link
              rel="stylesheet"
              href="${config.cdnBase}/${config.version}/main.css	"
            />
          </head>
          <body>
            <script>
              const otMeta = document.createElement('meta');
              otMeta.httpEquiv = 'origin-trial';
              otMeta.content = '${originTrial}';
              document.head.append(otMeta);
            </script>
            <div id="main"></div>
            <script src="${config.cdnBase}/${config.version}/bundle.js"></script>
          </body>
        </html>`,
    );
  });
}

export const OpenSumiRunWithIDEPrefix: ControllerFacade = {
  route(hono) {
    registerOpenSumiRun(hono, '/ide');
  },
};

export const OpenSumiRun: ControllerFacade = {
  route(hono) {
    registerOpenSumiRun(hono);
  },
};
