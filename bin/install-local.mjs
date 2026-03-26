#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, readFileSync, readlinkSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const hasYes = args.includes("--yes");
const hasNoInstall = args.includes("--no-install");
const hasCodex = args.includes("--codex");
const hasClaude = args.includes("--claude");

function getArg(name) {
  const direct = args.find((arg) => arg.startsWith(`${name}=`));

  if (direct) {
    return direct.slice(name.length + 1);
  }

  const index = args.indexOf(name);

  if (index !== -1) {
    return args[index + 1];
  }

  return undefined;
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function promptEnabled() {
  return !hasYes && process.stdin.isTTY && process.stdout.isTTY;
}

async function askText(rl, label, defaultValue) {
  const suffix = defaultValue ? ` [${defaultValue}]` : "";
  const answer = (await rl.question(`${label}${suffix}: `)).trim();
  return answer || defaultValue;
}

async function askBoolean(rl, label, defaultValue) {
  const suffix = defaultValue ? " [Y/n]" : " [y/N]";
  const answer = (await rl.question(`${label}${suffix}: `)).trim().toLowerCase();

  if (!answer) {
    return defaultValue;
  }

  return answer === "y" || answer === "yes";
}

function ensureDir(dirPath) {
  mkdirSync(dirPath, { recursive: true });
}

function writeTextFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  writeFileSync(filePath, content, "utf8");
}

function mergeGitignore(filePath, entries) {
  const existing = existsSync(filePath) ? readFileSync(filePath, "utf8").split(/\r?\n/) : [];
  const set = new Set(existing.filter(Boolean));

  for (const entry of entries) {
    set.add(entry);
  }

  writeTextFile(filePath, `${Array.from(set).sort().join("\n")}\n`);
}

function ensureSymlink(linkPath, targetPath) {
  ensureDir(path.dirname(linkPath));
  const relativeTarget = toPosix(path.relative(path.dirname(linkPath), targetPath)) || ".";

  if (existsSync(linkPath) || lstatSafe(linkPath)) {
    const current = lstatSafe(linkPath);

    if (current?.isSymbolicLink() && readlinkSync(linkPath) === relativeTarget) {
      return;
    }

    rmSync(linkPath, { force: true, recursive: true });
  }

  symlinkSync(relativeTarget, linkPath, "dir");
}

function ensureFileSymlink(linkPath, targetPath) {
  ensureDir(path.dirname(linkPath));
  const relativeTarget = toPosix(path.relative(path.dirname(linkPath), targetPath)) || ".";

  if (existsSync(linkPath) || lstatSafe(linkPath)) {
    const current = lstatSafe(linkPath);

    if (current?.isSymbolicLink() && readlinkSync(linkPath) === relativeTarget) {
      return;
    }

    rmSync(linkPath, { force: true, recursive: true });
  }

  symlinkSync(relativeTarget, linkPath, "file");
}

function lstatSafe(filePath) {
  try {
    return lstatSync(filePath);
  } catch {
    return null;
  }
}

function renderPackageJson({ dependencySpec, installerPath }) {
  const existing = existsSync(path.join(process.cwd(), "package.json"))
    ? JSON.parse(readFileSync(path.join(process.cwd(), "package.json"), "utf8"))
    : null;
  const name = existing?.name ?? path.basename(process.cwd());

  return {
    ...(existing ?? {}),
    name,
    private: true,
    type: "module",
    scripts: {
      ...(existing?.scripts ?? {}),
      "check:metabase": "node ./scripts/check-metabase.mjs",
      "setup:metabase": `node ${installerPath} --target .`
    },
    dependencies: {
      ...(existing?.dependencies ?? {}),
      dotenv: existing?.dependencies?.dotenv ?? "^17.3.1",
      "metabase-skill": dependencySpec
    }
  };
}

function renderReadme() {
  return `# metabase-agent

Ad-hoc local repo for running Codex and Claude against Metabase through the shared \`metabase-skill\` package.

## Setup

\`\`\`bash
git clone <public-metabase-skill-repo>
cd metabase-agent
node ../metabase-skill/bin/install-local.mjs
\`\`\`

Then:

1. Fill \`.env\` if the installer did not create it for you.
2. Run \`npm run check:metabase\`.
3. Use the shared \`metabase\` skill plus the local \`metabase-agent\` skill.
`;
}

function renderAgentsMd() {
  return `# Repository Guidelines

- Load \`.env\` before running Metabase checks or scripts.
- Prefer the local \`metabase-skill\` library over ad-hoc \`fetch\` calls.
- Start work with access + discovery:
  - \`session.properties()\`
  - \`user.current()\`
  - \`database.list()\`
  - \`database.metadata(id)\`
  - \`search.list({ q })\`
- Prefer schema exploration and saved questions before writing native SQL.
- Keep repo-specific agent workflow in the local \`metabase-agent\` skill.
- Use \`npm run check:metabase\` as the first smoke check after env changes.
`;
}

function renderRepoSkill() {
  return `---
name: metabase-agent
description: Repo-specific instructions for using the local metabase-skill package and env wiring inside metabase-agent.
---

# metabase-agent

Use this skill when working inside \`metabase-agent\`.

## Repo Workflow

- Read \`.env\` for \`METABASE_BASE_URL\` and \`METABASE_API_KEY\`.
- Validate access with \`npm run check:metabase\` before deeper work.
- Import from \`metabase-skill\`, not from raw relative paths.
- Prefer:
  - \`session.properties()\`
  - \`user.current()\`
  - \`database.list()\`
  - \`database.metadata(id)\`
  - \`search.list({ q })\`
  - \`card.query(...)\`
  - \`dataset.query(...)\`
- Keep raw endpoint usage for cases where helpers do not cover the endpoint.
`;
}

function renderEnvExample() {
  return `# Copy to .env and put the real API key there. Do not commit .env.
METABASE_BASE_URL=https://metabase.portals-mem.com
METABASE_API_KEY=your_key_here
`;
}

function renderEnv(baseUrl, apiKey) {
  return `METABASE_BASE_URL=${baseUrl}
METABASE_API_KEY=${apiKey}
`;
}

function renderCheckScript() {
  return `#!/usr/bin/env node

import { config as loadDotEnv } from "dotenv";
import { createMetabaseClient } from "metabase-skill";

loadDotEnv();

const baseUrl = process.env.METABASE_BASE_URL;
const apiKey = process.env.METABASE_API_KEY;

if (!baseUrl || !apiKey) {
  console.error("Missing METABASE_BASE_URL or METABASE_API_KEY in .env");
  process.exit(1);
}

const client = createMetabaseClient({ baseUrl, apiKey });
const [session, currentUser] = await Promise.all([
  client.session.properties(),
  client.user.current()
]);

console.log(\`Metabase version: \${session.version?.tag ?? "unknown"}\`);
console.log(\`Current user: \${currentUser.common_name ?? currentUser.email ?? currentUser.id ?? "unknown"}\`);
`;
}

async function main() {
  const rl = promptEnabled()
    ? readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
    : null;

  const defaultTarget = path.resolve(getArg("--target") ?? process.cwd());
  const defaultSkillPath = path.resolve(getArg("--skill-path") ?? repoRoot);

  const targetDir = rl ? path.resolve(await askText(rl, "Target repo path", defaultTarget)) : defaultTarget;
  const skillPath = rl ? path.resolve(await askText(rl, "Path to local metabase-skill repo", defaultSkillPath)) : defaultSkillPath;
  const installCodex = hasCodex || (!hasCodex && !hasClaude && (rl ? await askBoolean(rl, "Wire Codex local skills?", true) : true));
  const installClaude = hasClaude || (!hasCodex && !hasClaude && (rl ? await askBoolean(rl, "Wire Claude local skills?", true) : true));
  const shouldRunInstall = hasNoInstall ? false : rl ? await askBoolean(rl, "Run npm install after scaffolding?", true) : true;

  if (!existsSync(skillPath)) {
    throw new Error(`Skill repo does not exist: ${skillPath}`);
  }

  if (!existsSync(path.join(skillPath, "skill", "SKILL.md"))) {
    throw new Error(`Expected shared skill at ${path.join(skillPath, "skill", "SKILL.md")}`);
  }

  ensureDir(targetDir);
  process.chdir(targetDir);

  const dependencySpec = `file:${toPosix(path.relative(targetDir, skillPath) || ".")}`;
  const installerPath = toPosix(path.relative(targetDir, path.join(skillPath, "bin", "install-local.mjs")));
  const packageJsonPath = path.join(targetDir, "package.json");
  const packageJson = renderPackageJson({
    dependencySpec,
    installerPath
  });

  writeTextFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
  mergeGitignore(path.join(targetDir, ".gitignore"), [".env", "node_modules"]);
  writeTextFile(path.join(targetDir, ".env.example"), renderEnvExample());
  writeTextFile(path.join(targetDir, "README.md"), renderReadme());
  writeTextFile(path.join(targetDir, "AGENTS.md"), renderAgentsMd());
  writeTextFile(path.join(targetDir, "scripts", "check-metabase.mjs"), renderCheckScript());
  writeTextFile(path.join(targetDir, ".agents", "skills", "metabase-agent", "SKILL.md"), renderRepoSkill());

  if (installClaude) {
    ensureFileSymlink(path.join(targetDir, "CLAUDE.md"), path.join(targetDir, "AGENTS.md"));
  }

  if (installCodex) {
    ensureSymlink(path.join(targetDir, ".agents", "skills", "metabase"), path.join(skillPath, "skill"));
  }

  if (installClaude) {
    ensureDir(path.join(targetDir, ".claude", "skills"));
    ensureSymlink(path.join(targetDir, ".claude", "skills", "metabase-agent"), path.join(targetDir, ".agents", "skills", "metabase-agent"));

    if (installCodex) {
      ensureSymlink(path.join(targetDir, ".claude", "skills", "metabase"), path.join(targetDir, ".agents", "skills", "metabase"));
    } else {
      ensureSymlink(path.join(targetDir, ".claude", "skills", "metabase"), path.join(skillPath, "skill"));
    }
  }

  const envPath = path.join(targetDir, ".env");
  const envExists = existsSync(envPath);
  let shouldWriteEnv = !envExists;

  if (envExists && rl) {
    shouldWriteEnv = await askBoolean(rl, "Overwrite existing .env?", false);
  }

  if (shouldWriteEnv) {
    const baseUrl = rl
      ? await askText(rl, "METABASE_BASE_URL", process.env.METABASE_BASE_URL ?? "https://metabase.portals-mem.com")
      : process.env.METABASE_BASE_URL ?? "https://metabase.portals-mem.com";
    const apiKey = rl
      ? await askText(rl, "METABASE_API_KEY", process.env.METABASE_API_KEY ?? "")
      : process.env.METABASE_API_KEY ?? "";

    writeTextFile(envPath, renderEnv(baseUrl, apiKey));
  }

  rl?.close();

  if (shouldRunInstall) {
    const install = spawnSync("npm", ["install"], {
      cwd: targetDir,
      stdio: "inherit"
    });

    if (install.status !== 0) {
      process.exit(install.status ?? 1);
    }
  }

  process.stdout.write([
    "",
    `Scaffolded ${targetDir}`,
    `Shared skill source: ${skillPath}`,
    "Next step: npm run check:metabase",
    ""
  ].join("\n"));
}

await main();
