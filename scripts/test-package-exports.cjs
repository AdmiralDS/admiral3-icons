const { execFileSync } = require('child_process');
const { mkdtempSync, rmSync } = require('fs');
const { tmpdir } = require('os');
const { join, resolve } = require('path');

const packageRoot = resolve(__dirname, '..');
const tempDir = mkdtempSync(join(tmpdir(), 'admiral-icons-package-exports-'));

const run = (command, args, options = {}) =>
  execFileSync(command, args, {
    cwd: tempDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim();

try {
  const tarballName = execFileSync('npm', ['pack', '--silent', '--pack-destination', tempDir], {
    cwd: packageRoot,
    encoding: 'utf8',
  }).trim();
  const tarballPath = join(tempDir, tarballName);

  run('npm', ['init', '-y']);
  run('npm', ['install', '--silent', '--omit=peer', tarballPath]);

  const dataResult = run('node', [
    '--input-type=module',
    '-e',
    [
      "try { import.meta.resolve('@admiral-ds/admiral3-icons/build/service/CheckOutline.svg'); throw new Error('SVG build subpath should not be exported'); } catch (error) { if (error.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED') throw error; }",
      "const { ServiceCheckOutlineData } = await import('@admiral-ds/admiral3-icons/data');",
      "const { FlagsRussianFederationData } = await import('@admiral-ds/admiral3-icons/flags-data');",
      "const { renderSvgIconToString } = await import('@admiral-ds/admiral3-icons/vanilla');",
      "const renderedIcon = renderSvgIconToString(ServiceCheckOutlineData, { width: 32, className: 'check' });",
      "if (!renderedIcon.startsWith('<svg') || !renderedIcon.includes('width=\"32\"') || !renderedIcon.includes('class=\"check\"') || !renderedIcon.includes('<path')) throw new Error('Vanilla SVG renderer returned invalid markup');",
      'const renderedFlag = renderSvgIconToString(FlagsRussianFederationData);',
      "if (!renderedFlag.includes('<mask') || !renderedFlag.includes('<rect')) throw new Error('Complex SVG data was not preserved');",
      "console.log('data and vanilla exports work without React');",
    ].join(' '),
  ]);

  run('npm', ['install', '--silent', 'react@^19.2.4', 'react-dom@^19.2.4']);

  const esmResult = run('node', [
    '--input-type=module',
    '-e',
    [
      "import * as icons from '@admiral-ds/admiral3-icons';",
      "import * as flags from '@admiral-ds/admiral3-icons/flags';",
      "const rootFlagExports = Object.keys(icons).filter((name) => name.startsWith('Flags'));",
      "if (rootFlagExports.length > 0) throw new Error(`Root import should not expose flags: ${rootFlagExports.join(', ')}`);",
      'console.log(`esm icons ${Object.keys(icons).length}`);',
      'console.log(`esm flags ${Object.keys(flags).length}`);',
    ].join(' '),
  ]);

  console.log(dataResult);
  console.log(esmResult);
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
