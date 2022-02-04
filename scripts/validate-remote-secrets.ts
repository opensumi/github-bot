import allSecretKeys from './secrets';
import minimist from 'minimist';
const argv = minimist(process.argv.slice(2));
console.log(argv);
import { execSync } from 'child_process';

const result = execSync(
  `./node_modules/.bin/wrangler secret list ${
    argv.env ? `--env ${argv.env}` : ''
  }`,
);
const remoteValue = JSON.parse(result.toString()) as {
  name: string;
  type: string;
}[];
const remoteKeys = remoteValue.map((v) => v.name);
console.log(
  `🚀 ~ file: validate-remote-secrets.ts ~ line 10 ~ result`,
  remoteKeys,
);

for (const key of allSecretKeys) {
  if (!remoteKeys.includes(key)) {
    throw new Error(`${key} not set in remote`);
  }
}
