import { html } from 'hono/html';

import Environment from '@/env';
import { OpenSumiRunKVManager } from '@/kv/run';

export function route(hono: THono) {
  hono.get('/ide/:group/:project', async (c) => {
    const env = Environment.instance().environment;
    const version = await OpenSumiRunKVManager.instance().getCdnVersion();
    const originTrial = await OpenSumiRunKVManager.instance().getTrialToken(
      env,
    );

    const cdnBase =
      env === 'prod'
        ? 'https://g.alicdn.com/opensumi/run'
        : 'https://dev.g.alicdn.com/opensumi/run';

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
            <link rel="stylesheet" href="${cdnBase}/${version}/main.css	" />
          </head>
          <body>
            <script>
              const otMeta = document.createElement('meta');
              otMeta.httpEquiv = 'origin-trial';
              otMeta.content = '${originTrial}';
              document.head.append(otMeta);
            </script>
            <div id="main"></div>
            <script src="${cdnBase}/${version}/bundle.js"></script>
          </body>
        </html>`,
    );
  });
}
