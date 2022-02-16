import { writeFileSync } from 'fs';
import allSecretKeys from './secrets';

async function main() {
  const envKeys = allSecretKeys;

  const envExample = envKeys.map((key) => `${key}=`).join('\n');
  writeFileSync('./.env.example', envExample);

  const typings = envKeys.map((key) => `declare const ${key}: string;`);
  typings.push('');
  typings.push('declare const WEBHOOKS_INFO: KVNamespace;');
  typings.push('');

  writeFileSync('./src/typings.d.ts', typings.join('\n'));
}

main();
