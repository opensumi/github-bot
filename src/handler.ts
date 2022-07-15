import { Router } from './router';
import { handler as dingHandler } from './ding';
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

router.get('/proxy/?:url', (request) => {
  const { params, query } = request;
  const _url = params?.url ?? query?.url;
  if (_url) {
    const url = new URL(_url);
    return fetch(url.toString(), request);
  }

  return error(401, 'not a valid hostname');
});

router.all('*', () => {
  return error(404, 'no router found');
});

export async function handleRequest(event: FetchEvent) {
  return router.handle(event.request, event);
}
