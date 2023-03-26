const fs = require('fs');
const path = require('path');

const tsj = require('ts-json-schema-generator');

/** @type {import('ts-json-schema-generator/dist/src/Config').Config} */
const config = {
  path: path.resolve(__dirname, '../src/kv/types.ts'),
  tsconfig: path.resolve(__dirname, '../tsconfig.build.json'),
};

const generator = tsj.createGenerator(config);

function ensureDirSync(file) {
  const dirname = path.dirname(file);
  if (fs.existsSync(dirname)) {
    return true;
  }
  fs.mkdirSync(dirname);
}

function createTypeSchema(type, name) {
  const schema = generator.createSchema(type);
  const schemaString = JSON.stringify(schema, null, 2);
  const output_path = path.resolve(
    __dirname,
    '../src/public/json-schemas',
    `${name}.schema.json`,
  );
  ensureDirSync(output_path);
  fs.writeFile(output_path, schemaString, (err) => {
    if (err) throw err;
  });
}

createTypeSchema('AppSetting', 'app-settings');
createTypeSchema('ISetting', 'setting');
createTypeSchema('IDingBotSetting', 'ding-setting');
createTypeSchema('IDingInfo', 'ding-info');
