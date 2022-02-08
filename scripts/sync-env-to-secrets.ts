// this script will read `.env.{env}` file, and use `wrangler secrets put`

import { parse } from 'dotenv';
import { readFileSync } from 'fs';
import { exec } from 'child_process';

import minimist from 'minimist';
const argv = minimist(process.argv.slice(2));
console.log(argv);

async function main() {
  let envFile = './.env';
  if (argv.env) {
    envFile = envFile + '.' + argv.env;
  }
  const content = readFileSync(envFile);
  const envs = parse(content);
  console.log(`envs`, envs);

  for await (const [k, v] of Object.entries(envs)) {
    const cmd = `./node_modules/.bin/wrangler secret put ${k} ${
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
