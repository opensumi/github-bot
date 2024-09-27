import 'dotenv/config';

import { context as createContext } from 'esbuild';
import mri from 'mri';

import { DEFAULT_BUILD_ARGS, buildParams } from './build';

const argv = mri(process.argv.slice(2));

const define = {
  ...DEFAULT_BUILD_ARGS,
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
