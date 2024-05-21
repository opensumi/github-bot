import { existsSync, mkdirSync, writeFile } from 'fs';
import { resolve, dirname as _dirname } from 'path';

import prettier from 'prettier';
import { createGenerator } from 'ts-json-schema-generator';

const { format, resolveConfig, resolveConfigFile } = prettier;

const __dirname = _dirname(new URL(import.meta.url).pathname);

/** @type {import('ts-json-schema-generator/dist/src/Config').Config} */
const config = {
  path: resolve(__dirname, '../src/kv/types.ts'),
  tsconfig: resolve(__dirname, '../tsconfig.build.json'),
};

function usePrettier(schema) {
  return format(schema, {
    parser: 'json',
    ...resolveConfig(resolveConfigFile.sync()),
  });
}

const generator = createGenerator(config);

function ensureDirSync(file) {
  const dirname = _dirname(file);
  if (existsSync(dirname)) {
    return true;
  }
  mkdirSync(dirname);
}

function createTypeSchema(type, name) {
  const schema = generator.createSchema(type);
  const schemaString = JSON.stringify(schema, null, 2);
  const output_path = resolve(
    __dirname,
    '../src/public/json-schemas',
    `${name}.schema.json`,
  );
  ensureDirSync(output_path);
  writeFile(output_path, usePrettier(schemaString), (err) => {
    if (err) throw err;
  });
}

createTypeSchema('AppSetting', 'app-settings');
createTypeSchema('ISetting', 'setting');
createTypeSchema('IDingBotSetting', 'ding-setting');
createTypeSchema('IDingInfo', 'ding-info');
