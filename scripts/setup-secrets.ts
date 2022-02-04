// 这个脚本会读取 .env 文件，然后使用 wrangler secrets put

import { parse } from 'dotenv';
import { readFileSync } from 'fs';

import { exec } from 'child_process';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const argv = require('minimist')(process.argv.slice(2));
console.log(argv);

async function main() {
  const content = readFileSync('./.env');
  const envs = parse(content);
  console.log(`envs`, envs);

  for await (const [k, v] of Object.entries(envs)) {
    const cmd = `yarn wrangler secret put ${k} ${
      argv.env ? `--env ${argv.env}` : ''
    }`;
    console.log(`cmd: `, cmd);
    const child = exec(cmd, (_err, stdout, stderr) => {
      console.log(`stderr`, stderr);
      console.log(`stdout`, stdout);
    });
    child.stdin?.write(v);
    child.stdin?.end();
  }
}
main();
