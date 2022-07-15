import { Router } from './router';
import { handler as dingHandler } from './ding';
import { handler as proxyHandler } from './proxy';
import { webhookHandler } from './github';
import { handler as githubAppHandler } from './github/app';
import { error } from './utils';

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

router.exception((request, err) => {
  console.error(err);
  return error(500, 'server internal error');
});

export async function handleRequest(event: FetchEvent) {
  return router.handle(event.request, event);
}
