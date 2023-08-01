import 'dotenv/config';

import fs from 'fs/promises';

import { context as createContext } from 'esbuild';
import mri from 'mri';

import { buildParams, DEFAULT_BUILD_ARGS } from './build';

const argv = mri(process.argv.slice(2));

const define = {
  ...DEFAULT_BUILD_ARGS,
  'process.env.IF_DEF__CHATGPT': JSON.stringify(true),
} as Record<string, string>;

async function buildNode() {
  const context = await createContext({
    ...buildParams,
    entryPoints: ['src/runtime/node/index.ts'],
    outbase: 'src/runtime',
    platform: 'node',
    target: 'node16',
    format: 'cjs',
    define,
  });

  if (argv['watch']) {
    await context.watch();
  } else {
    await context.rebuild().then((v) => {
      console.log(`build ~ result`, v);
      context.dispose();
    });
  }
}

async function copyResources() {
  console.log('Copied resources.');
}

async function main() {
  await buildNode();
  await copyResources();
}

main();
