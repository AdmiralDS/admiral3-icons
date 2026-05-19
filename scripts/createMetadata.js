import fse from 'fs-extra';
import * as path from 'path';

import { createFlagsMeta } from './createFlagsMetadata.js';

const BUILD_DIR = 'build';
const METADATA_FILE = 'metadata.json';

(function () {
  if (!fse.existsSync(BUILD_DIR) || !fse.lstatSync(BUILD_DIR).isDirectory()) return;

  let metadata = {};

  const categories = fse.readdirSync(BUILD_DIR);
  categories.forEach((categoryName) => {
    const categoryMeta = createCategoryMeta(categoryName);
    metadata = { ...metadata, ...categoryMeta };
  });

  fse.writeJSONSync(METADATA_FILE, metadata, { spaces: 2 });

  createFlagsMeta(`${BUILD_DIR}/flags`);

  function createCategoryMeta(categoryName) {
    const categoryMeta = [];

    const icons = fse
      .readdirSync(path.join(BUILD_DIR, categoryName))
      .filter((iconFileName) => path.extname(iconFileName) === '.svg');
    icons.forEach((iconFileName) => {
      const iconMeta = createIconMeta(iconFileName, categoryName);
      categoryMeta.push(iconMeta);
    });

    return { [categoryName]: categoryMeta };
  }

  function createIconMeta(iconFileName, categoryName) {
    const iconPath = path.join(BUILD_DIR, categoryName, iconFileName);
    const svg = fse.readFileSync(iconPath, 'utf8');
    const name = iconFileName.replace(/.svg/g, '');
    const type = name.toLowerCase().includes('outline') ? 'outline' : 'solid';

    return {
      name,
      path: process.platform === 'win32' ? iconPath.replace(/\\/g, '/') : iconPath,
      svg,
      type,
    };
  }
})();
