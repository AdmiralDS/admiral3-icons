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
  run('npm', ['install', '--silent', tarballPath]);

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

  console.log(esmResult);
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
