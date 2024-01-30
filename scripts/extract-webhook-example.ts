import fs from 'fs';
import path from 'path';

import WEBHOOKS, { WebhookDefinition } from '@octokit/webhooks-examples';
const baseDir = path.join(__dirname, '../test/fixtures/generated');
fs.rmSync(baseDir, { recursive: true, force: true });
fs.mkdirSync(baseDir, { recursive: true });

function writeFile(name: string, data: any) {
  fs.writeFileSync(
    path.join(baseDir, name + '.json'),
    JSON.stringify(data, null, 2),
  );
}

for (const webhook of WEBHOOKS) {
  if (webhook.name === 'pull_request') {
    const pull_request = webhook as WebhookDefinition<'pull_request'>;
    pull_request.examples.forEach((v, i) => {
      if (
        v.action === 'edited' ||
        v.action === 'opened' ||
        v.action === 'closed'
      ) {
        writeFile(`pull_request_${i}_${v.action}`, v);
      }
    });
  }
  if (webhook.name === 'pull_request_review') {
    const pull_request_review =
      webhook as WebhookDefinition<'pull_request_review'>;
    pull_request_review.examples.forEach((v, i) => {
      writeFile(`pull_request_review_${i}_${v.action}_${v.review.state}`, v);
    });
  }
  if (webhook.name === 'pull_request_review_comment') {
    const pull_request_review_comment =
      webhook as WebhookDefinition<'pull_request_review_comment'>;
    pull_request_review_comment.examples.forEach((v, i) => {
      if (
        v.action === 'edited' ||
        v.action === 'created' ||
        v.action === 'deleted'
      ) {
        writeFile(`pull_request_review_comment_${i}_${v.action}`, v);
      }
    });
  }
}
