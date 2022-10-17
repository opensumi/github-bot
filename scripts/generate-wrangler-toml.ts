import { readFileSync, writeFileSync } from 'fs';

import { config } from 'dotenv';
config();


let text = readFileSync('./wrangler.tpl.toml').toString();

const kvLocalId = process.env.KV_LOCAL_ID;
const kvProdId = process.env.KV_PROD_ID;

if (kvLocalId) {
  text = text.replace(new RegExp('{{KV_LOCAL_ID}}', 'g'), kvLocalId);
}
if (kvProdId) {
  text = text.replace(new RegExp('{{KV_PROD_ID}}', 'g'), kvProdId);
}

writeFileSync('./wrangler.toml', text);
