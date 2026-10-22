const { spawnSync } = require('node:child_process');
const { resolve } = require('node:path');

const packageRoot = resolve(__dirname, '..');
const [script, ...args] = process.argv.slice(2);

const candidates = process.platform === 'win32' ? [['py', '-3'], ['python'], ['python3']] : [['python3'], ['python']];

const python = candidates.find(([command, ...prefix]) => {
  const result = spawnSync(command, [...prefix, '-c', 'import sys; sys.exit(sys.version_info.major != 3)'], {
    cwd: packageRoot,
    stdio: 'ignore',
  });
  return !result.error && result.status === 0;
});

if (!python) {
  console.error('Python 3 was not found. Install Python 3 and make it available in PATH.');
  process.exit(1);
}

const run = (command, commandArgs) => {
  const result = spawnSync(command, commandArgs, { cwd: packageRoot, stdio: 'inherit' });
  if (result.error) console.error(result.error.message);
  if (result.error || result.status !== 0) process.exit(result.status ?? 1);
};

const [command, ...prefix] = python;
run(command, [...prefix, resolve(__dirname, script), ...args]);

if (!args.includes('--help') && !args.includes('-h')) {
  const npmCli = process.env.npm_execpath;
  if (!npmCli) {
    console.error('Run this script through npm run icons:update or npm run icons:update:manual.');
    process.exit(1);
  }
  run(process.execPath, [npmCli, 'run', 'build-meta']);
}
