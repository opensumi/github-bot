import { writeFileSync } from 'fs';

async function main() {
  const envKeys = [
    'DINGTALK_SECRET',
    'DINGTALK_WEBHOOK_URL',
    'DINGTALK_OUTGOING_TOKEN',
    'GH_WEBHOOK_SECRET',
    'GH_APP_ID',
    'GH_APP_WEBHOOK_SECRET',
    'GH_APP_PRIVATE_KEY',
  ];

  const envExample = envKeys.map((key) => `${key}=`).join('\n');
  writeFileSync('./.env.example', envExample);

  const typings = envKeys
    .map((key) => `declare const ${key}: string;`)
    .join('\n');
  writeFileSync('./src/typings.d.ts', typings);
}

main();
