import WEBHOOKS, { WebhookDefinition } from '@octokit/webhooks-examples';
import {
  PullRequestClosedEvent,
  PullRequestOpenedEvent,
} from '@octokit/webhooks-types';

let pull_request = {} as WebhookDefinition<'pull_request'>;
let pull_request_closed = {} as PullRequestClosedEvent;
let pull_request_opened = {} as PullRequestOpenedEvent;

for (const webhook of WEBHOOKS) {
  if (webhook.name === 'pull_request') {
    pull_request = webhook as WebhookDefinition<'pull_request'>;
    pull_request.examples.forEach((v) => {
      if (v.action === 'closed') {
        pull_request_closed = v;
      }
      if (v.action === 'opened') {
        pull_request_opened = v;
      }
    });
  }
}

export { pull_request, pull_request_closed, pull_request_opened };
