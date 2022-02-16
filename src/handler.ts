import { Router } from './router';
import { handler as dingHandler } from './ding';
import { webhookHandler } from './github';
import { handler as githubAppHandler } from './github/app';
import { error } from './utils';

export const router = Router();

// 接收 DingTalk webhook 事件
router.post('/ding_webhook', dingHandler);
// 接收 Github App 的 webhook 事件
router.post('/gh_app', githubAppHandler);
// 接收 Github webhook 事件
router.post('/webhook/:id', webhookHandler);

router.all('*', () => {
  return error(404, 'no router found');
});

export async function handleRequest(event: FetchEvent) {
  return router.handle(event.request, event);
}
