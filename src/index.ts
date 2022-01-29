import { Router } from 'itty-router';
import { handler as dingHandler } from './dingWebhook';
import { handler as githubHandler } from './github';

const router = Router();

// 接收 DingTalk webhook 事件
router.post('/ding_webhook', dingHandler);
// 接收 Github webhook 事件
router.post('/gh_webhook', githubHandler);

router.all('*', () => {
  return Response.redirect(
    'https://github.com/opensumi/github-webhook-handler',
    301,
  );
});

addEventListener('fetch', (event) => {
  event.respondWith(router.handle(event.request, event));
});
