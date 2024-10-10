import 'dotenv/config';

import { Plugin } from 'esbuild';

import { build } from './base';

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

async function main() {
  await build({
    entryPoints: ['./src/runtime/cfworker/index.ts'],
    platform: 'browser',
    target: 'es2020',
    format: 'esm',
    treeShaking: true,
    plugins: [resolvePlugin],
    external: externalNodeBuiltins,
  });
}

main();
