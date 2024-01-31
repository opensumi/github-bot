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
        writeFile(`pull_request_${v.pull_request.number}_${i}_${v.action}`, v);
      }
    });
  }
  if (webhook.name === 'pull_request_review') {
    const pull_request_review =
      webhook as WebhookDefinition<'pull_request_review'>;
    pull_request_review.examples.forEach((v, i) => {
      writeFile(
        `pull_request_review_${v.pull_request.number}_${i}_${v.action}_${v.review.state}`,
        v,
      );
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
        writeFile(
          `pull_request_${v.pull_request.number}_review_comment_${i}_${v.action}`,
          v,
        );
      }
    });
  }
  if (webhook.name === 'discussion') {
    const discussion = webhook as WebhookDefinition<'discussion'>;
    discussion.examples.forEach((v, i) => {
      if (v.discussion.number !== 90) {
        return;
      }
      writeFile(`discussion_${v.discussion.number}_${i}_${v.action}`, v);
    });
  }

  if (webhook.name === 'discussion_comment') {
    const discussion_comment =
      webhook as WebhookDefinition<'discussion_comment'>;
    discussion_comment.examples.forEach((v, i) => {
      if (v.discussion.number !== 90) {
        return;
      }

      writeFile(
        `discussion_comment_${v.discussion.number}_${i}_${v.action}`,
        v,
      );
    });
  }
}
