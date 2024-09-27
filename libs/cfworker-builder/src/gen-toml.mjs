import 'dotenv/config';

import { watch as _watch, readFileSync, writeFileSync } from 'fs';

import MagicString from 'magic-string';

import { debounce } from './utils/debounce.mjs';

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
      console.log(`updated: "${key}" -> 🤫`);
    } else {
      console.warn(`env variable "${key}" not found.`);
    }
  }

  writeFileSync(targetFilePath, magic.toString());
}

const debouncedRun = debounce(run, 300);

export function watch() {
  console.log('watching template file changes...');

  _watch(tplFilePath, {}, () => {
    console.log(
      `- ${new Date().toLocaleString('zh-CN')}: ${tplFilePath} changed.`,
    );
    debouncedRun();
  });
}
