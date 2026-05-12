#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const VALID = ['patch', 'minor', 'major'];
const bump = process.argv[2];

if (!VALID.includes(bump)) {
  console.error(`Usage: npm run release -- <patch|minor|major>`);
  process.exit(1);
}

const run = (cmd, opts = {}) => {
  console.log(`\n$ ${cmd}`);
  return execSync(cmd, { stdio: 'inherit', ...opts });
};
const capture = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim();

console.log('==> Verifying clean working tree');
const status = capture('git status --porcelain');
if (status) {
  console.error('Working tree not clean. Commit or stash changes first.');
  console.error(status);
  process.exit(1);
}

console.log('==> Running full lint');
run('npm run lint');

console.log('==> Running full test suite');
run('npm test');

console.log(`==> Bumping version (${bump})`);
const newVersion = capture(`npm version ${bump} --no-git-tag-version`);
console.log(`New version: ${newVersion}`);

console.log('==> Updating CHANGELOG.md');
const changelogPath = path.resolve('CHANGELOG.md');
const previousTag = (() => {
  try {
    return capture('git describe --tags --abbrev=0');
  } catch {
    return '';
  }
})();
const range = previousTag ? `${previousTag}..HEAD` : '';
const log = capture(`git log ${range} --pretty=format:"- %s (%h)" --no-merges`);
const today = new Date().toISOString().slice(0, 10);
const entry = `## ${newVersion} — ${today}\n\n${log || '- (no changes)'}\n\n`;
const existing = existsSync(changelogPath)
  ? readFileSync(changelogPath, 'utf8')
  : '# Changelog\n\n';
const header = existing.startsWith('# Changelog') ? '' : '# Changelog\n\n';
const body = existing.startsWith('# Changelog')
  ? existing.replace(/^# Changelog\n+/, '')
  : existing;
writeFileSync(changelogPath, `# Changelog\n\n${entry}${body}`);

console.log('==> Committing version + changelog');
run('git add package.json package-lock.json CHANGELOG.md');
run(`git commit -m "chore(release): ${newVersion}"`);

console.log('==> Tagging');
run(`git tag ${newVersion}`);

console.log('==> Pushing tag and commit');
run('git push');
run(`git push origin ${newVersion}`);

console.log(`\nReleased ${newVersion}`);
