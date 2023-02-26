import 'dotenv/config';

import { context as createContext } from 'esbuild';
import mri from 'mri';

const argv = mri(process.argv.slice(2));
console.log(argv);

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
    target: 'node18',
    format: 'cjs',
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
  await Promise.all([buildNode()]);
}

main();
