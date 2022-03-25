import { config } from 'dotenv';
config();

import minimist from 'minimist';
const argv = minimist(process.argv.slice(2));
console.log(argv);

import { build } from 'esbuild';

build({
  entryPoints: ['./src'],
  bundle: true,
  outfile: './index.js',
  minify: true,
  color: true,
  watch: argv['watch'],
})
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    throw err;
  });
