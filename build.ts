// eslint-disable-next-line import/order
import { config } from 'dotenv';
config();

import { build } from 'esbuild';
import mri from 'mri';

const argv = mri(process.argv.slice(2));
console.log(argv);

build({
  entryPoints: ['./src/runtime/cfworker/index.ts'],
  bundle: true,
  outfile: './index.js',
  minify: false,
  color: true,
  watch: argv['watch'],
  loader: {
    '.html': 'text',
    '.svg': 'text',
  },
  platform: 'browser',
  target: 'es2020',
  format: 'esm',
})
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    throw err;
  });
