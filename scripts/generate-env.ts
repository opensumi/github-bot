import { readFileSync, writeFileSync } from 'fs';

const envKeys = [
  'DINGTALK_SECRET',
  'DINGTALK_WEBHOOK_URL',
  'DINGTALK_OUTGOING_TOKEN',
  'SELF_GITHUB_WEBHOOK_SECRET',
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

const defineBlock = `const secrets = ${JSON.stringify(envKeys, null, 2)};

const define = {};
for (const s of secrets) {
  if (process.env[s]) {
    define[s] = JSON.stringify(process.env[s].trim());
  } else {
    console.error(\`env \${s} not set!\`);
  }
}`;

const buildScript = readFileSync('./build.js', 'utf8');
const lines = buildScript.split('\n');
const startLineNumber = lines.findIndex((line) =>
  line.includes('// --- SECRETS START ---'),
);

const endLineNumber = lines.findIndex((line) =>
  line.includes('// --- SECRETS END ---'),
);

const newLines = lines
  .slice(0, startLineNumber + 1)
  .concat(defineBlock.split('\n'), lines.slice(endLineNumber));

writeFileSync('./build.js', newLines.join('\n'));
