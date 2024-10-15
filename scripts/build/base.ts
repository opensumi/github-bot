import { merge } from 'es-toolkit';
import { BuildOptions } from 'esbuild';
import { context as createContext } from 'esbuild';

import mri from 'mri';

const argv = mri(process.argv.slice(2));

export const buildParams = {
  minify: false,
  color: true,
  loader: {
    '.html': 'text',
    '.svg': 'text',
  },
  bundle: true,
  outdir: 'dist',
  outbase: 'src/runtime',
  logLevel: 'info',
} as BuildOptions;

export const build = async (opts: BuildOptions) => {
  const context = await createContext(merge(buildParams, opts));

  if (argv['watch']) {
    console.log('watching...');
    await context.watch();
  } else {
    await context.rebuild().then((v) => {
      console.log(`build ~ result`, v);
      context.dispose();
    });
  }
};
