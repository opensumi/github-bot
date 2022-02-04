import { config } from 'dotenv';
config();

import minimist from 'minimist';
import { buildSync } from 'esbuild';

const argv = minimist(process.argv.slice(2));
console.log(argv);

const result = buildSync({
  entryPoints: ['./src'],
  bundle: true,
  outfile: './index.js',
  minify: true,
  color: true,
  watch: argv['watch'],
});

console.log(result);
