const fse = require('fs-extra');
const path = require('path');

const { readIconCategoryConfig } = require('./icon-categories.cjs');

const categories = readIconCategoryConfig();
const values = categories.map(({ value }) => value);

const valueUnion = values.map((value) => `  | '${value}'`).join('\n');
const configItems = categories
  .map(
    ({ label, value, pixsoFrameName }) =>
      `  { label: '${label}', value: '${value}', pixsoFrameName: '${pixsoFrameName}' },`,
  )
  .join('\n');

const content = `export type IconCategory =\n${valueUnion};\n\nexport type IconCategoryConfig = {\n  label: string;\n  value: IconCategory;\n  pixsoFrameName: string;\n};\n\nexport const ICON_CATEGORY_CONFIG: Array<IconCategoryConfig> = [\n${configItems}\n];\n`;

fse.writeFileSync(path.resolve('src/iconCategoryConfig.ts'), content);
