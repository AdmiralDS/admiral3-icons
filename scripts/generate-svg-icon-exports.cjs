// Этот script запускается автоматически каждый раз перед запуском сторибука

const path = require('path');
const fse = require('fs-extra');
const prettier = require('prettier');
const metadata = require('../metadata.json');
const { getCategoryValues } = require('./icon-categories.cjs');

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const CATEGORIES = getCategoryValues();
const ROOT_CATEGORIES = CATEGORIES.filter((category) => category !== 'flags');

const parseAttributes = (source) => {
  const attributes = {};
  const attributePattern = /([^\s=]+)="([^"]*)"/g;
  let match;

  while ((match = attributePattern.exec(source)) !== null) {
    attributes[match[1]] = match[2];
  }

  return attributes;
};

const parseSvg = (svg) => {
  const stack = [];
  let root;

  for (const token of svg.match(/<[^>]+>/g) ?? []) {
    if (token.startsWith('</')) {
      stack.pop();
      continue;
    }

    const tagMatch = token.match(/^<([^\s/>]+)([^>]*)\/?\s*>$/);
    if (!tagMatch) continue;

    const node = {
      tag: tagMatch[1],
      attributes: parseAttributes(tagMatch[2]),
    };

    const parent = stack.at(-1);
    if (parent) {
      parent.children ??= [];
      parent.children.push(node);
    } else {
      root = node;
    }

    if (!token.endsWith('/>')) stack.push(node);
  }

  if (!root || root.tag !== 'svg' || stack.length !== 0) {
    throw new Error('Cannot parse generated SVG');
  }

  return root;
};

const ensureFileExists = (filePath) => {
  if (!fse.existsSync(filePath)) {
    fse.createFileSync(filePath);
  }
};

const generateReactExportFile = () => {
  const categoryFileNames = new Set(CATEGORIES.map((category) => `${category}.ts`));

  fse
    .readdirSync(path.resolve('src/icons'), { withFileTypes: true })
    .filter((entry) => entry.isFile() && path.extname(entry.name) === '.ts' && !categoryFileNames.has(entry.name))
    .forEach((entry) => fse.removeSync(path.resolve('src/icons', entry.name)));

  for (const category of CATEGORIES) {
    const exportFileName = path.resolve('src/icons', `${category}.ts`);

    ensureFileExists(exportFileName);

    const exportFileContent = (metadata[category] ?? [])
      .map(
        ({ name, path }) =>
          `export { default as ${capitalizeFirstLetter(category)}${name} } from '../../${path}?react';`,
      )
      .concat(['']) // add empty lane at the file end
      .join('\n');

    fse.writeFileSync(exportFileName, exportFileContent);
  }
};

const generateRootIndexFile = () => {
  const indexFilePath = path.resolve('src', 'index.ts');

  ensureFileExists(indexFilePath);

  const exportFileContent = ROOT_CATEGORIES.map((category) => `export * from './icons/${category}';`)
    .concat([''])
    .join('\n');

  fse.writeFileSync(indexFilePath, exportFileContent);
};

const generateFlagsIndexFile = () => {
  const indexFilePath = path.resolve('src', 'flags.ts');

  ensureFileExists(indexFilePath);

  const exportFileContent = CATEGORIES.includes('flags') ? "export * from './icons/flags';\n" : '';

  fse.writeFileSync(indexFilePath, exportFileContent);
};

const generateDataExportFiles = async () => {
  const dataDirectory = path.resolve('src/data');
  fse.ensureDirSync(dataDirectory);

  const categoryFileNames = new Set(CATEGORIES.map((category) => `${category}.ts`));
  fse
    .readdirSync(dataDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && path.extname(entry.name) === '.ts' && !categoryFileNames.has(entry.name))
    .forEach((entry) => fse.removeSync(path.join(dataDirectory, entry.name)));

  for (const category of CATEGORIES) {
    const definitions = (metadata[category] ?? []).map(({ name, svg }) => {
      const root = parseSvg(svg);
      const exportName = `${capitalizeFirstLetter(category)}${name}Data`;
      const definition = {
        name: `${capitalizeFirstLetter(category)}${name}`,
        category,
        attributes: root.attributes,
        children: root.children ?? [],
      };

      return `export const ${exportName}: SvgIconDefinition = ${JSON.stringify(definition)};`;
    });

    const filePath = path.join(dataDirectory, `${category}.ts`);
    const content = ["import type { SvgIconDefinition } from '../svg-data';", '', ...definitions, ''].join('\n');
    const prettierConfig = (await prettier.resolveConfig(filePath)) ?? {};
    const formattedContent = await prettier.format(content, { ...prettierConfig, filepath: filePath });
    fse.writeFileSync(filePath, formattedContent);
  }

  fse.writeFileSync(
    path.resolve('src/data.ts'),
    ROOT_CATEGORIES.map((category) => `export * from './data/${category}';`)
      .concat(["export type { SvgIconDefinition, SvgIconNode } from './svg-data';", ''])
      .join('\n'),
  );

  fse.writeFileSync(
    path.resolve('src/flags-data.ts'),
    CATEGORIES.includes('flags')
      ? "export * from './data/flags';\nexport type { SvgIconDefinition, SvgIconNode } from './svg-data';\n"
      : "export type { SvgIconDefinition, SvgIconNode } from './svg-data';\n",
  );
};

const generateExports = async () => {
  generateReactExportFile();
  generateRootIndexFile();
  generateFlagsIndexFile();
  await generateDataExportFiles();
};

generateExports().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
