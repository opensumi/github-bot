import 'dotenv/config';

import { context as createContext, Plugin } from 'esbuild';
import mri from 'mri';

const argv = mri(process.argv.slice(2));
console.log(argv);

const resolvePlugin = {
  name: 'resolvePlugin',
  setup(build) {
    build.onResolve(
      { filter: /^decode-named-character-reference$/ },
      async (args) => {
        const result = {
          path: require.resolve('decode-named-character-reference'),
        };
        console.log(`intercept ${args.path} resolve to ${result.path}`);
        return result;
      },
    );
  },
} as Plugin;

async function main() {
  const context = await createContext({
    entryPoints: ['./src/runtime/cfworker/index.ts'],
    bundle: true,
    outfile: './index.js',
    minify: false,
    color: true,
    loader: {
      '.html': 'text',
      '.svg': 'text',
    },
    platform: 'browser',
    target: 'es2020',
    format: 'esm',
    plugins: [resolvePlugin],
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

main();
