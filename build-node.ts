import 'dotenv/config';

import { context as createContext } from 'esbuild';
import mri from 'mri';

const argv = mri(process.argv.slice(2));
console.log(argv);

// const envHostsToCopy = [
//   'HOST',
//   'OPENAI_ACCESS_TOKEN',
//   'CHATGPT_API_REVERSE_PROXY_URL',
//   'CLOUDFLARE_AUTH_TOKEN',
//   'CLOUDFLARE_ACCOUNT_ID',
//   'CLOUDFLARE_NAMESPACE_ID',
// ];

const define = {} as Record<string, string>;

// envHostsToCopy.forEach((v) => {
//   define[`process.env.${v}`] = JSON.stringify(process.env[v]);
// });

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
    define: {
      ...define,
    },
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
