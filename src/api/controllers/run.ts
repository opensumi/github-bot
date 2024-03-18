import { html } from 'hono/html';

export function route(hono: THono) {
  hono.get('/ide/:group/:project', async (c) => {
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
              href="https://dev.g.alicdn.com/opensumi/run/0.0.1/main.css	"
            />
          </head>
          <body>
            <div id="main"></div>
            <script src="https://dev.g.alicdn.com/opensumi/run/0.0.1/bundle.js"></script>
          </body>
        </html> `,
    );
  });
}
