//@ts-check
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const argv = require('minimist')(process.argv.slice(2));
console.log(argv);

const secrets = [
  'DINGTALK_SECRET',
  'DINGTALK_WEBHOOK_URL',
  'DINGTALK_OUTGOING_TOKEN',
  'SELF_GITHUB_WEBHOOK_SECRET',
];

const define = {};
for (const s of secrets) {
  if (process.env[s]) {
    define[s] = JSON.stringify(process.env[s].trim());
  } else {
    console.error(`env ${s} not set!`);
  }
}

const ghAppSecrets = [
  'GH_APP_ID',
  'GH_APP_WEBHOOK_SECRET',
  'GH_APP_PRIVATE_KEY',
];

for (const s of ghAppSecrets) {
  if (process.env[s]) {
    define[s] = JSON.stringify(process.env[s].trim());
  } else {
    console.error(`env ${s} not set!`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('esbuild')
  .build({
    entryPoints: ['./src'],
    bundle: true,
    outfile: './index.js',
    minify: true,
    color: true,
    define: {
      ...define,
    },
    watch: argv['watch'],
  })
  .then((result) => {
    console.log(result);
  })
  .catch((e) => {
    throw e;
  });
