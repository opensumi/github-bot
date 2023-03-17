const argv = process.argv;
const targetPath = argv[2];
if (!targetPath) {
  throw new Error('targetPath is required');
}

import { readFile, writeFile } from 'fs/promises';

import { execaCommand } from 'execa';

async function main() {
  const cmd = `openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in ${targetPath} -out ${targetPath}.pkcs8`;
  await execaCommand(cmd, { shell: true });
  const text = await readFile(`${targetPath}.pkcs8`, 'utf-8');
  const data = text.replaceAll('\n', '\\n');
  await writeFile(`${targetPath}.pkcs8`, data, 'utf-8');
  await execaCommand(`cat ${targetPath}.pkcs8 | pbcopy`, { shell: true });
}

main();
