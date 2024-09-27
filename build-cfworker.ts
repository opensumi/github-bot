import 'dotenv/config';

import { Plugin, context as createContext } from 'esbuild';
import mri from 'mri';

import { DEFAULT_BUILD_ARGS, buildParams } from './build';

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

function wrapNodeExternal(list: string[]) {
  const external = new Set<string>();
  list.forEach((name) => {
    external.add(`node:${name}`);
    external.add(name);
  });
  return Array.from(external);
}

const externalNodeBuiltins = wrapNodeExternal(['async_hooks']);

async function buildWorker() {
  const context = await createContext({
    ...buildParams,
    entryPoints: ['./src/runtime/cfworker/index.ts'],
    platform: 'browser',
    target: 'es2020',
    format: 'esm',
    treeShaking: true,
    plugins: [resolvePlugin],
    define: DEFAULT_BUILD_ARGS,
    external: externalNodeBuiltins,
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
