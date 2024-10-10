//@ts-check

import { existsSync, mkdirSync } from 'fs';
import { dirname as _dirname, resolve } from 'path';
import { writeFile } from 'fs/promises';

import { createGenerator } from 'ts-json-schema-generator';

const __dirname = _dirname(new URL(import.meta.url).pathname);

/** @type {import('ts-json-schema-generator/dist/src/Config').Config} */
const config = {
  path: resolve(__dirname, '../src/dao/types.ts'),
  tsconfig: resolve(__dirname, '../tsconfig.build.json'),
};

const generator = createGenerator(config);

function ensureDirSync(file) {
  const dirname = _dirname(file);
  if (existsSync(dirname)) {
    return true;
  }
  mkdirSync(dirname);
}

async function createTypeSchema(type, name) {
  const schema = generator.createSchema(type);
  const schemaString = JSON.stringify(schema, null, 2);
  const output_path = resolve(
    __dirname,
    '../src/public/json-schemas',
    `${name}.schema.json`,
  );
  ensureDirSync(output_path);
  await writeFile(output_path, schemaString);
}

createTypeSchema('AppSetting', 'app-settings');
createTypeSchema('ISetting', 'setting');
createTypeSchema('IDingBotSetting', 'ding-setting');
createTypeSchema('IDingInfo', 'ding-info');

createTypeSchema('IOpenSumiRunConfig', 'run-config');
createTypeSchema('IOpenSumiRunOriginalTrialToken', 'run-original-trial-token');

createTypeSchema('IGitHubOauthAppConfig', 'github-oauth-app-config');
