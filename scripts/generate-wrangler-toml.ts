import { readFileSync, writeFileSync } from 'fs';

import { config } from 'dotenv';
import MagicString from 'magic-string';

config();

const text = readFileSync('./wrangler.tpl.toml').toString();

const magic = new MagicString(text);

const regex = /{{(.+?)}}/gm;

const matches = text.matchAll(regex);

if (!matches) {
  process.exit(0);
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

writeFileSync('./wrangler.toml', magic.toString());
