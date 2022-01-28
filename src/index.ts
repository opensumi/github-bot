import { Router } from 'itty-router';
import { error } from 'itty-router-extras';
import { Webhooks } from '@octokit/webhooks';
import { WebhookEventHandlerError } from '@octokit/webhooks/dist-types/types';
import { WebhookEventName } from '@octokit/webhooks-types';
import { templates } from './template';
import { sendToDing } from './utils';

const router = Router();

// 接收 DingTalk webhook 事件
router.post('/ding', () => {});
// 接收 Github webhook 事件
router.post('/gh', async (req: Request, event: FetchEvent) => {
  const headers = req.headers;
  let status = 200;
  let respBody = '';

  const webhooks = new Webhooks({
    secret: GITHUB_WEBHOOK_SECRET,
  });

  webhooks.onAny(async ({ id, name, payload }) => {
    console.log('Receive Github Webhook, id: ', id, ', name: ', name);
    const templateWorker = templates[name] as (payload: any) => {
      title: string;
      text: string;
    };
    if (!templateWorker) {
      console.log('不支持的消息');
      // await sendToDing(
      //   '不支持的消息 ' + name,
      //   JSON.stringify(payload),
      // );
      return;
    }
    const data = templateWorker(payload);
    await sendToDing(data.title, data.text);
  });

  if (!headers.get('User-Agent')?.startsWith('GitHub-Hookshot/')) {
    console.warn('User agent: not from GitHub');
    return error(403, 'User agent: not from GitHub');
  }
  if (headers.get('Content-Type') !== 'application/json') {
    console.warn('Content type: not json');
    return error(415, 'Content type: not json');
  }

  const eventName = headers.get('x-github-event') as WebhookEventName;
  console.log(
    `🚀 ~ file: github.ts ~ line 70 ~ GithubController ~ post ~ eventName`,
    eventName,
  );
  const signatureSHA256 = headers.get('x-hub-signature-256') as string;
  console.log(
    `🚀 ~ file: github.ts ~ line 71 ~ GithubController ~ post ~ signatureSHA256`,
    signatureSHA256,
  );
  const id = headers.get('x-github-delivery') as string;

  let payload: any;
  try {
    payload = await req.json();
  } catch (err) {
    return error(400, 'Invalid JSON');
  }

  try {
    event.waitUntil(
      webhooks.verifyAndReceive({
        id: id,
        name: eventName,
        payload: payload,
        signature: signatureSHA256.replace('sha256=', ''),
      }),
    );

    respBody = 'ok\n';
  } catch (error) {
    const statusCode = Array.from(error as WebhookEventHandlerError)[0].status;
    status = typeof statusCode !== 'undefined' ? statusCode : 500;
    respBody = String(error);
  }
  return new Response(respBody, {
    status,
  });
});
router.all('*', () => {
  return Response.redirect(
    'https://github.com/opensumi/github-webhook-handler',
    301,
  );
});

addEventListener('fetch', (event) => {
  event.respondWith(router.handle(event.request, event));
});
