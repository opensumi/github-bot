import { getURL } from './proxy';
import { baseHandler, setupWebhooksTemplate, webhooksFactory } from './github';
import { initApp } from './github/app';
import { Env } from './env';
import { Hono } from 'hono';
import { StatusCode } from 'hono/utils/http-status';
import { prettyJSON } from 'hono/pretty-json';
import { logger } from 'hono/logger';
import { DingKVManager } from './ding/secrets';
import { DingBot, verifyMessage } from './ding/bot';
import { GitHubKVManager } from './github/storage';
import Toucan from 'toucan-js';

const app = new Hono<{ Bindings: Env }>();

declare module 'hono' {
  interface Context {
    sentry?: Toucan;
    waitUntil: (promise: Promise<any>) => void;
    error(status: StatusCode, content: string): Response;
    message(text: string): Response;
  }
}

app.use('*', async (c, next) => {
  if (c.env.SENTRY_DSN) {
    const sentry = new Toucan({
      dsn: c.env.SENTRY_DSN,
      context: c.executionCtx,
      request: c.req,
      allowedHeaders: ['user-agent'],
      allowedSearchParams: /(.*)/,
    });
    c.sentry = sentry;

    const waitUntil = c.executionCtx.waitUntil.bind(c.executionCtx);
    c.executionCtx.waitUntil = (promise) => {
      waitUntil(
        (async () => {
          try {
            await promise;
          } catch (err) {
            sentry.captureException(err);
          }
        })(),
      );
    };
  }

  await next();
});

app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', async (c, next) => {
  c.error = (status = 500, content = 'Internal Server Error.') => {
    return c.json(
      {
        status,
        error: content,
      },
      status,
    );
  };
  c.message = (text: string) => {
    return c.json({
      message: text,
    });
  };
  await next();
});

app.get('/', (c) =>
  c.html(`<p>
Nice catch 👍

<div>
  <a href="https://github.com/opensumi/github-bot">https://github.com/opensumi/github-bot</a>
</div>
</p>`),
);

app.get('/favicon.ico', async (c) => {
  return c.body(
    `<svg xmlns="http://www.w3.org/2000/svg" baseProfile="full" width="200" height="200">
  <rect width="100%" height="100%" fill="#F38020"/>
  <text font-size="120" font-family="Arial, Helvetica, sans-serif" text-anchor="end" fill="#FFF" x="185" y="185">H</text>
</svg>`,
    200,
    {
      'content-type': 'image/svg+xml',
    },
  );
});

// 接收 DingTalk webhook 事件
app.post('/ding/:id', async (c) => {
  const id = c.req.param('id') ?? c.req.query('id');

  console.log(`handler ~ id`, id);
  if (!id) {
    return c.error(401, 'need a valid id');
  }
  const kvManager = new DingKVManager(c.env);
  const setting = await kvManager.getSettingById(id);
  if (!setting) {
    return c.error(404, 'id not found');
  }

  if (!setting.outGoingToken) {
    return c.error(401, 'please set webhook token in bot settings');
  }

  const errMessage = await verifyMessage(c.req.headers, setting.outGoingToken);
  if (errMessage) {
    console.log(`check sign error:`, errMessage);
    return c.error(403, errMessage);
  }

  const bot = new DingBot(
    id,
    await c.req.json(),
    kvManager,
    c.executionCtx,
    c.env,
    setting,
  );
  c.executionCtx.waitUntil(bot.handle());
  return c.message('ok');
});

// 接收 Github App 的 webhook 事件
app.post('/github/app/:id', async (c) => {
  const id = c.req.param('id') ?? c.req.query('id');
  if (!id) {
    return c.error(401, 'need a valid id');
  }
  const githubKVManager = new GitHubKVManager(c.env);
  const setting = await githubKVManager.getAppSettingById(id);
  if (!setting) {
    return c.error(404, 'id not found');
  }
  if (!setting.githubSecret) {
    return c.error(401, 'please set app webhook secret in settings');
  }

  const app = await initApp(setting);
  return baseHandler(app.webhooks, c.req, c.env, c.executionCtx);
});

// 接收 Github webhook 事件
app.post('/webhook/:id', async (c) => {
  const id = c.req.param('id') ?? c.req.query('id');
  if (!id) {
    return c.error(401, 'need a valid id');
  }
  const githubKVManager = new GitHubKVManager(c.env);
  const setting = await githubKVManager.getSettingById(id);
  if (!setting) {
    return c.error(404, 'id not found');
  }
  if (!setting.githubSecret) {
    return c.error(401, 'please set webhook secret in kv');
  }

  const webhooks = webhooksFactory(setting.githubSecret);

  setupWebhooksTemplate(webhooks as any, {
    setting: setting,
  });
  return baseHandler(webhooks, c.req, c.env, c.executionCtx);
});

app.all('/proxy/:url', async (c) => {
  const _url = c.req.param('url') ?? c.req.query('url');
  if (_url) {
    const candidates = [_url, decodeURIComponent(_url)]
      .map(getURL)
      .filter(Boolean);

    if (candidates.length > 0 && candidates[0]) {
      const url = candidates[0];
      return fetch(url.toString(), c.req);
    }
  }
  return c.error(401, 'not a valid hostname');
});

app.notFound((c) => {
  return c.error(404, 'no router found');
});

app.onError((err, c) => {
  console.error(err);
  c.sentry?.captureException(err);
  return c.error(500, 'server internal error');
});

export default app;
