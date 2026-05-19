const path = require('path');

const fse = require('fs-extra');
const { optimize } = require('svgo');

const CURRENT_COLOR = 'currentColor';
const ORIGINAL_COLOR_CATEGORIES = new Set(['bank', 'flags']);

const walkElements = (node, callback) => {
  if (!node || typeof node !== 'object') return;

  if (node.type === 'element') {
    callback(node);
  }

  if (Array.isArray(node.children)) {
    node.children.forEach((childNode) => walkElements(childNode, callback));
  }
};

const normalizePaint = (paint) => paint?.trim().toLowerCase();

const isZeroOpacity = (opacity) => {
  return opacity !== undefined && Number(opacity) === 0;
};

const isVisiblePaint = (attributes, opacityAttributeName) => {
  return !isZeroOpacity(attributes?.[opacityAttributeName]) && !isZeroOpacity(attributes?.opacity);
};

const isSolidPaint = (paint) => {
  return paint && paint !== 'none' && !paint.startsWith('url(');
};

const getSinglePaint = (root) => {
  const paints = new Set();
  let hasPaintServer = false;

  walkElements(root, (node) => {
    const { attributes = {} } = node;
    const fill = normalizePaint(attributes.fill);
    const stroke = normalizePaint(attributes.stroke);

    if (fill && fill !== 'none' && isVisiblePaint(attributes, 'fill-opacity')) {
      if (isSolidPaint(fill)) {
        paints.add(fill);
      } else {
        hasPaintServer = true;
      }
    }

    if (stroke && stroke !== 'none' && isVisiblePaint(attributes, 'stroke-opacity')) {
      if (isSolidPaint(stroke)) {
        paints.add(stroke);
      } else {
        hasPaintServer = true;
      }
    }
  });

  return !hasPaintServer && paints.size === 1 ? [...paints][0] : null;
};

const createSvgoOptions = (preserveOriginalPaint) => ({
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          convertPathData: false,
        },
      },
    },
    'removeDimensions',
    'prefixIds',
    {
      name: 'addAttributesToSVGElement',
      params: {
        attributes: [
          {
            focusable: false,
          },
        ],
      },
    },
    {
      name: 'removeSpecificPath',
      fn: () => ({
        element: {
          enter: (node, parentNode) => {
            if (node.name === 'path' && node.attributes?.d) {
              const normalizedD = node.attributes.d.replace(/\s+/g, '').toLowerCase();
              if (normalizedD === 'm00h24v24h0z' || normalizedD === 'M0 0H40V40H0z') {
                // Удаляем узел из родительского элемента
                if (parentNode && parentNode.children) {
                  const index = parentNode.children.indexOf(node);
                  if (index !== -1) {
                    parentNode.children.splice(index, 1);
                  }
                }

                return null; // Помечаем узел для удаления
              }
            }
          },
        },
      }),
    },
    ...(!preserveOriginalPaint
      ? [
          {
            name: 'replaceMonochromePaintWithCurrentColor',
            fn: () => ({
              root: {
                enter: (root) => {
                  const singlePaint = getSinglePaint(root);

                  if (!singlePaint) return;

                  walkElements(root, (node) => {
                    const { attributes = {} } = node;
                    const fill = normalizePaint(attributes.fill);
                    const stroke = normalizePaint(attributes.stroke);

                    if (fill === singlePaint) {
                      attributes.fill = CURRENT_COLOR;
                      delete attributes['fill-opacity'];
                    }

                    if (stroke === singlePaint) {
                      attributes.stroke = CURRENT_COLOR;
                      delete attributes['stroke-opacity'];
                    }

                    if (fill === singlePaint || stroke === singlePaint) {
                      delete attributes.opacity;
                    }
                  });
                },
              },
            }),
          },
        ]
      : []),
  ],
});

const BUILD_DIR = 'build';
const SOURCE_DIR = 'public/icons';

(function () {
  makeDirectory(BUILD_DIR);

  const categories = fse.readdirSync(SOURCE_DIR);
  categories.forEach((categoryName) => formatCategory(categoryName));

  function makeDirectory(path) {
    if (!fse.existsSync(path)) {
      fse.mkdirSync(path);
    }
  }

  function formatCategory(categoryName) {
    makeDirectory(path.join(BUILD_DIR, categoryName));

    const categoryPath = path.join(SOURCE_DIR, categoryName);
    const icons = fse.readdirSync(categoryPath).filter((iconName) => path.extname(iconName) === '.svg');

    icons.forEach((iconName) => {
      const iconPath = path.join(categoryPath, iconName);

      const svg = fse.readFileSync(iconPath, 'utf8');
      const formattedSvg = format(svg, iconPath, ORIGINAL_COLOR_CATEGORIES.has(categoryName));

      fse.writeFileSync(path.join(BUILD_DIR, categoryName, convertToCamelCase(iconName)), formattedSvg);
    });
  }

  function format(svg, path, preserveOriginalPaint) {
    const conf = { ...createSvgoOptions(preserveOriginalPaint), path };
    try {
      const { data } = optimize(svg, conf);
      return data;
    } catch (error) {
      console.error(`SVGO failed for ${path}`);
      throw error;
    }
  }

  function convertToCamelCase(string) {
    const fileName = path.parse(string).name;
    const ext = path.parse(string).ext;

    return fileName
      .replace(/\W+/g, ' ')
      .replace(/\s[a-z]/g, (match) => match.toUpperCase())
      .replace(/^[a-z]/, (match) => match.toUpperCase())
      .replace(/\s/g, '')
      .concat(ext);
  }
})();
