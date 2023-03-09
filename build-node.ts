import 'dotenv/config';

import fs from 'fs/promises';

import { context as createContext } from 'esbuild';
import mri from 'mri';

import { DEFAULT_BUILD_ARGS } from './build';

const argv = mri(process.argv.slice(2));
console.log(argv);

const define = {
  ...DEFAULT_BUILD_ARGS,
  'process.env.IF_DEF__CHATGPT': JSON.stringify(true),
} as Record<string, string>;

async function buildNode() {
  const context = await createContext({
    entryPoints: ['src/runtime/node/index.ts'],
    bundle: true,
    outdir: 'dist',
    outbase: 'src/runtime',
    minify: false,
    color: true,
    loader: {
      '.html': 'text',
      '.svg': 'text',
    },
    platform: 'node',
    target: 'node16',
    format: 'cjs',
    define: {
      ...define,
    },
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
  await fs.copyFile(
    'node_modules/@dqbd/tiktoken/dist/node/_tiktoken_bg.wasm',
    'dist/node/_tiktoken_bg.wasm',
  );
  console.log('Copied resources.');
}

async function main() {
  await buildNode();
  await copyResources();
}

main();
