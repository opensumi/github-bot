import 'dotenv/config';

import { readFileSync, writeFileSync, watch as _watch } from 'fs';

import MagicString from 'magic-string';

const tplFilePath = './wrangler.tpl.toml';
const targetFilePath = './wrangler.toml';

export function run() {
  const text = readFileSync(tplFilePath).toString();

  const magic = new MagicString(text);

  const regex = /{{(.+?)}}/gm;

  const matches = text.matchAll(regex);

  if (!matches) {
    return;
  }

  for (const match of matches) {
    const key = match[1];
    const v = process.env[key];
    if (v && match.index) {
      magic.update(match.index, match.index + match[0].length, v);
      console.log(`"${key}" will be replaced to "[redacted]"`);
    } else {
      console.warn(`env variable "${key}" not found.`);
    }
  }

  writeFileSync(targetFilePath, magic.toString());
}

export function watch() {
  console.log('watching template file changes...');

  _watch(tplFilePath, {}, () => {
    console.log(`${tplFilePath} changed.`);
    run();
  });
}
