import { BuildOptions } from 'esbuild';

export const DEFAULT_BUILD_ARGS = {
  'process.env.IF_DEF__CHATGPT': JSON.stringify(false),
};

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
