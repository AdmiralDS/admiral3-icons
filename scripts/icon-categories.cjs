const fse = require('fs-extra');
const path = require('path');

const CONFIG_PATH = path.resolve('icon-categories.json');

const createCategoryMismatchMessage = ({ unexpected = [], missing = [], source }) => {
  const lines = [
    `Icon category list changed in ${source}. Update icon-categories.json first.`,
    `Unexpected categories: ${unexpected.length > 0 ? unexpected.join(', ') : 'none'}`,
    `Missing categories: ${missing.length > 0 ? missing.join(', ') : 'none'}`,
  ];

  return lines.join('\n');
};

const readIconCategoryConfig = () => {
  const categories = fse.readJSONSync(CONFIG_PATH);

  if (!Array.isArray(categories)) {
    throw new Error('icon-categories.json must contain an array.');
  }

  const values = new Set();
  const frameNames = new Set();

  categories.forEach((category, index) => {
    const missingFields = ['label', 'value', 'pixsoFrameName'].filter(
      (fieldName) => typeof category[fieldName] !== 'string' || category[fieldName].trim() === '',
    );

    if (missingFields.length > 0) {
      throw new Error(`icon-categories.json item ${index} is missing: ${missingFields.join(', ')}.`);
    }

    if (values.has(category.value)) {
      throw new Error(`Duplicate category value in icon-categories.json: ${category.value}`);
    }

    if (frameNames.has(category.pixsoFrameName)) {
      throw new Error(`Duplicate Pixso frame name in icon-categories.json: ${category.pixsoFrameName}`);
    }

    values.add(category.value);
    frameNames.add(category.pixsoFrameName);
  });

  return categories;
};

const getCategoryValues = () => readIconCategoryConfig().map(({ value }) => value);

module.exports = {
  CONFIG_PATH,
  createCategoryMismatchMessage,
  getCategoryValues,
  readIconCategoryConfig,
};
