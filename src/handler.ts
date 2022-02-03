import { Router } from 'itty-router';
import { handler as dingHandler } from './ding';
import { handler as githubHandler } from './github';

export const router = Router();

// 接收 DingTalk webhook 事件
router.post('/ding_webhook', dingHandler);
// 接收 Github webhook 事件
router.post('/gh_webhook', githubHandler);
// 接收 Github App 的 webhook 事件
router.post('/gh_app', githubHandler);

router.all('*', () => {
  return Response.redirect('https://github.com/opensumi/github-bot', 301);
});

export function handleRequest(event: FetchEvent) {
  return router.handle(event.request, event);
}
