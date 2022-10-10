import { config } from 'dotenv';
config();

import mri from 'mri';
const argv = mri(process.argv.slice(2));
console.log(argv);

import { build } from 'esbuild';

build({
  entryPoints: ['./src'],
  bundle: true,
  outfile: './index.js',
  minify: false,
  color: true,
  watch: argv['watch'],
  loader: {
    '.html': 'text',
  },
  platform: 'browser',
  target: 'es2020',
  format: 'esm',
  metafile: true,
})
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    throw err;
  });
