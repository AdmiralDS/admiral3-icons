// Этот script запускается автоматически каждый раз перед запуском сторибука

const path = require('path');
const fse = require('fs-extra');
const metadata = require('../metadata.json');

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const CATEGORIES = Object.keys(metadata);
const ROOT_CATEGORIES = CATEGORIES.filter((category) => category !== 'flags');

const ensureFileExists = (filePath) => {
  if (!fse.existsSync(filePath)) {
    fse.createFileSync(filePath);
  }
};

const generateReactExportFile = () => {
  CATEGORIES.forEach((category) => {
    const exportFileName = path.resolve('src/icons', `${category}.ts`);

    ensureFileExists(exportFileName);

    const exportFileContent = metadata[category]
      .map(
        ({ name, path }) =>
          `export { default as ${capitalizeFirstLetter(category)}${name} } from '../../${path}?react';`,
      )
      .concat(['']) // add empty lane at the file end
      .join('\n');

    fse.writeFileSync(exportFileName, exportFileContent);
  });
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

generateReactExportFile();
generateRootIndexFile();
generateFlagsIndexFile();
