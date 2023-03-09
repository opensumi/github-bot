// How to use?
// See https://smee.io/
// Smee is a webhook payload delivery service - it receives webhook payloads, and sends them to listening clients.

import SmeeClient from 'smee-client';

const allRoutes = [
  'ding-opensumi',
  'ding-trs',
  'github-app-opensumi',
  'github-app-qiuqiu',
  'webhook-opensumi',
];

const allClients = [] as SmeeClient[];

for (const routeName of allRoutes) {
  const source = 'https://smee.io/opensumi-github-bot-' + routeName;
  const target = 'http://localhost:8787/' + routeName.replace(/-/g, '/');

  const smee = new SmeeClient({
    source,
    target,
    logger: console,
  });

  smee.start();
  allClients.push(smee);
}

process.on('SIGINT', () => {
  process.exit();
});
