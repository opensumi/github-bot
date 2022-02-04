import allSecretKeys from './secrets';
import minimist from 'minimist';
import { execSync } from 'child_process';

const argv = minimist(process.argv.slice(2));
console.log(argv);

const env = argv.env || process.env.BUILD_ENVIRONMENT;

const result = execSync(
  `./node_modules/.bin/wrangler secret list ${env ? `--env ${env}` : ''}`,
);
const remoteValue = JSON.parse(result.toString()) as {
  name: string;
  type: string;
}[];

const remoteKeys = remoteValue.map((v) => v.name);
console.log(`remoteKeys: `, remoteKeys);

const missingKeys = [];

for (const key of allSecretKeys) {
  if (!remoteKeys.includes(key)) {
    missingKeys.push(key);
  }
}

if (missingKeys.length > 0) {
  console.log('missingKeys: ', missingKeys);
  process.exit(1);
}
