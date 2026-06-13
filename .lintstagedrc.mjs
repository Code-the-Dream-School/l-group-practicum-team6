import path from 'node:path';

const ROOT = process.cwd();
const WORKSPACES = ['shared', 'backend', 'frontend'];
const WORKSPACES_WITH_TESTS = ['backend', 'frontend'];

const quote = (p) => `"${p}"`;
const toRel = (abs) => path.relative(ROOT, abs);

const groupByWorkspace = (relFiles) => {
  const groups = { __root__: [] };
  for (const ws of WORKSPACES) groups[ws] = [];
  for (const f of relFiles) {
    const top = f.split('/')[0];
    if (WORKSPACES.includes(top)) groups[top].push(f);
    else groups.__root__.push(f);
  }
  return groups;
};

export default {
  '*.{ts,tsx,js,jsx,mjs,cjs}': (absFiles) => {
    const relFiles = absFiles.map(toRel);
    const cmds = [`prettier --write ${absFiles.map(quote).join(' ')}`];

    const groups = groupByWorkspace(relFiles);
    let sharedBuilt = false;

    for (const ws of WORKSPACES) {
      const files = groups[ws];
      if (!files.length) continue;
      const wsRel = files.map((f) => quote(path.relative(ws, f))).join(' ');
      cmds.push(`npm exec --workspace=${ws} -- eslint --fix --max-warnings=0 ${wsRel}`);

      if ((ws === 'backend' || ws === 'frontend') && !sharedBuilt) {
        cmds.push('npm run build -w shared');
        sharedBuilt = true;
      }

      cmds.push(`npm run typecheck -w ${ws}`);
      if (WORKSPACES_WITH_TESTS.includes(ws)) {
        cmds.push(`npm run test:related -w ${ws} -- ${wsRel}`);
      }
    }

    return cmds;
  },
  '*.{json,md,css,yml,yaml,html}': (absFiles) =>
    `prettier --write ${absFiles.map(quote).join(' ')}`,
};
