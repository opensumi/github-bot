// eslint-disable-next-line import/order
import { config } from 'dotenv';
config();

import { context as createContext } from 'esbuild';
import mri from 'mri';

const argv = mri(process.argv.slice(2));
console.log(argv);

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
