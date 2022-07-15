import { getURL } from './proxy';
import {
  baseHandler,
  setupWebhooksSendToDing,
  webhooksFactory,
} from './github';
import { initApp } from './github/app';
import { Env } from './env';
import { Hono } from 'hono';
import { StatusCode } from 'hono/dist/utils/http-status';
import { prettyJSON } from 'hono/pretty-json';
import { DingKVManager } from './ding/secrets';
import { DingBot, verifyMessage } from './ding/bot';
import { GitHubKVManager } from './github/storage';

const app = new Hono<Env>();

declare module 'hono' {
  interface Context {
    error(status: StatusCode, content: string): Response;
    message(text: string): Response;
  }
}

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
  next();
});

app.get('/', (c) => c.text('Hono!!'));

// 接收 DingTalk webhook 事件
app.post('/ding/?:id', async (c) => {
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

  const errMessage = await verifyMessage(c.req, setting.outGoingToken);
  if (errMessage) {
    console.log(`check sign error:`, errMessage);
    return c.error(403, errMessage);
  }

  const bot = new DingBot(
    id,
    await c.req.json(),
    kvManager,
    c.executionCtx!,
    c.env,
    setting,
  );
  c.executionCtx!.waitUntil(bot.handle());
  return c.message('ok');
});

// 接收 Github App 的 webhook 事件
app.post('/github/app/?:id', async (c) => {
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
  return baseHandler(app.webhooks, c.req, c.env, c.executionCtx!);
});

// 接收 Github webhook 事件
app.post('/webhook/?:id', async (c) => {
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
    return c.error(401, 'please set webhook secret in settings');
  }

  const webhooks = webhooksFactory(setting.githubSecret);

  setupWebhooksSendToDing(webhooks as any, {
    setting: setting,
  });
  return baseHandler(webhooks, c.req, c.env, c.executionCtx!);
});

app.all('/proxy/?:url', async (c) => {
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
  return c.error(500, 'server internal error');
});

export default app;
