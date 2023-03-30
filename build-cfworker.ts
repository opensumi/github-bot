import 'dotenv/config';

import { context as createContext, Plugin } from 'esbuild';
import mri from 'mri';

import { buildParams, DEFAULT_BUILD_ARGS } from './build';

const argv = mri(process.argv.slice(2));

const resolvePlugin = {
  name: 'resolvePlugin',
  setup(build) {
    build.onResolve(
      { filter: /^decode-named-character-reference$/ },
      async () => {
        const result = {
          path: require.resolve('decode-named-character-reference'),
        };
        return result;
      },
    );
  },
} as Plugin;

async function buildWorker() {
  const context = await createContext({
    ...buildParams,
    entryPoints: ['./src/runtime/cfworker/index.ts'],
    platform: 'browser',
    target: 'es2020',
    format: 'esm',
    plugins: [resolvePlugin],
    define: DEFAULT_BUILD_ARGS,
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

async function main() {
  await buildWorker();
}

main();
