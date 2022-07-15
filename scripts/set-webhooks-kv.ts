// wrangler kv:key put --binding=KV_PROD antdm {}
import { exec } from 'child_process';
import { readFileSync } from 'fs';

import minimist from 'minimist';
const argv = minimist(process.argv.slice(2));
console.log(argv);

async function main() {
  const data = readFileSync('./webhooks.json').toString();
  console.log(`🚀 ~ file: set-kv.ts ~ line 12 ~ main ~ data`, data);
  const json = JSON.parse(data);
  for (const [name, sec] of Object.entries(json)) {
    const cmd = `./node_modules/.bin/wrangler kv:key put --binding=KV_PROD ${
      argv.env ? `--env ${argv.env}` : ''
    } ${name} '${JSON.stringify(sec)}'`;
    exec(cmd, (_err, stdout, stderr) => {
      console.log(`stderr`, stderr);
      console.log(`stdout`, stdout);
    });
  }
}

main();
