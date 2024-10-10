import 'dotenv/config';
import { build } from './base';

async function main() {
  await build({
    entryPoints: ['src/runtime/node/index.ts'],
    outbase: 'src/runtime',
    platform: 'node',
    target: 'node18',
    format: 'cjs',
  });
}

main();
