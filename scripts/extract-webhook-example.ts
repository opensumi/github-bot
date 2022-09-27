import WEBHOOKS, { WebhookDefinition } from '@octokit/webhooks-examples';

import fs from 'fs';
import path from 'path';
const baseDir = path.join(__dirname, '../test/fixtures/generated');
fs.rmSync(baseDir, { recursive: true, force: true });
fs.mkdirSync(baseDir, { recursive: true });

function writeFile(name: string, data: any) {
  fs.writeFileSync(
    path.join(baseDir, name + '.json'),
    JSON.stringify(data, null, 2),
  );
}

let pull_request = {} as WebhookDefinition<'pull_request'>;

for (const webhook of WEBHOOKS) {
  if (webhook.name === 'pull_request') {
    pull_request = webhook as WebhookDefinition<'pull_request'>;
    pull_request.examples.forEach((v, i) => {
      console.log(`🚀 ~ file: extract-webhook-example.ts ~ line 22 ~ pull_request.examples.forEach ~ v`, v.action);
      if (
        v.action === 'edited' ||
        v.action === 'opened' ||
        v.action === 'closed'
      ) {
        writeFile(`pull_request_${i}_${v.action}`, v);
      }
    });
  }
}
