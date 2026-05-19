import fse from 'fs-extra';

import CountryNames from './constants/country-names.js';
import CountryRusNames from './constants/country-rus-names.js';

const FILE_NAME = 'flags-metadata.json';
const PACKAGE_NAME = '@admiral-ds/admiral3-icons';
const NON_COUNTRY_FLAG_FILES = new Set(['CAF.svg', 'CAS.svg', 'CEU.svg', 'CNA.svg', 'COC.svg', 'CSA.svg', 'WW.svg']);

export function createFlagsMeta(buildDir) {
  if (!fse.existsSync(buildDir) || !fse.lstatSync(buildDir).isDirectory()) return;

  const files = fse.readdirSync(buildDir);

  const countryNames = Object.values(CountryNames);

  const data = files
    .map((key) => {
      if (NON_COUNTRY_FLAG_FILES.has(key)) return undefined;

      const path = `${PACKAGE_NAME}/build/flags/${key}`;
      const countryName = key.match(/(\w+).svg$/);
      const country = countryName && countryName[1] && countryNames.find((name) => name === countryName[1]);
      if (country) {
        const item = Object.entries(CountryNames).find(([_code, name]) => name === country);
        const isoCode = item && item[0];
        const rusName = isoCode && CountryRusNames[isoCode];
        return { path, isoCode, name: country, rusName };
      } else {
        // eslint-disable-next-line no-console
        console.error(`can not find country for file ${key}`);
      }
    })
    .filter((item) => !!item);

  fse.writeJSONSync(FILE_NAME, data, { spaces: 2 });
}
