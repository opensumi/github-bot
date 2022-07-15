import { Router } from 'itty-router';
import { handler as dingHandler } from './ding';
import { handler as proxyHandler } from './proxy';
import { webhookHandler } from './github';
import { handler as githubAppHandler } from './github/app';
import { error } from '@/runtime/response';

export const router = Router();

// 接收 DingTalk webhook 事件
router.post('/ding/?:id', dingHandler);
// 接收 Github App 的 webhook 事件
router.post('/github/app/?:id', githubAppHandler);
// 接收 Github webhook 事件
router.post('/webhook/?:id', webhookHandler);

router.all('/proxy/?:url', proxyHandler);

router.all('*', () => {
  return error(404, 'no router found');
});

const errorHandler = (err: Error) => {
  console.error(err);
  return error(500, 'server internal error');
};

export interface Env {
  KV_PROD: KVNamespace;
  HOST: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    return router.handle(request, env, ctx).catch(errorHandler);
  },
};
