#!/usr/bin/env node

import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, rmSync, symlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const sourceSkillDir = path.join(repoRoot, "skill");
const sourceRuntimePath = path.join(sourceSkillDir, "sdk", "metabase-client.mjs");
const args = process.argv.slice(2);

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

function hasFlag(name) {
  return args.includes(name);
}

function promptEnabled() {
  return !hasFlag("--yes") && process.stdin.isTTY && process.stdout.isTTY;
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

function lstatSafe(filePath) {
  try {
    return lstatSync(filePath);
  } catch {
    return null;
  }
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function ensureDirSymlink(linkPath, targetPath) {
  ensureDir(path.dirname(linkPath));
  const relativeTarget = toPosix(path.relative(path.dirname(linkPath), targetPath)) || ".";
  const current = lstatSafe(linkPath);

  if (current?.isSymbolicLink() && readlinkSync(linkPath) === relativeTarget) {
    return;
  }

  if (current) {
    rmSync(linkPath, { force: true, recursive: true });
  }

  symlinkSync(relativeTarget, linkPath, "dir");
}

function copySkill(sourceDir, destinationDir) {
  rmSync(destinationDir, { recursive: true, force: true });
  ensureDir(path.dirname(destinationDir));
  cpSync(sourceDir, destinationDir, {
    recursive: true
  });
}

function digestDirectory(dirPath, baseDir = dirPath) {
  const hash = createHash("sha256");
  const entries = readdirSync(dirPath, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of entries) {
    const absolutePath = path.join(dirPath, entry.name);
    const relativePath = toPosix(path.relative(baseDir, absolutePath));

    if (entry.isDirectory()) {
      hash.update(`dir:${relativePath}\n`);
      hash.update(digestDirectory(absolutePath, baseDir));
      continue;
    }

    if (entry.isFile()) {
      hash.update(`file:${relativePath}\n`);
      hash.update(readFileSync(absolutePath));
      hash.update("\n");
      continue;
    }

    if (entry.isSymbolicLink()) {
      hash.update(`symlink:${relativePath}:${readlinkSync(absolutePath)}\n`);
    }
  }

  return hash.digest("hex");
}

async function main() {
  if (!existsSync(path.join(sourceSkillDir, "SKILL.md"))) {
    throw new Error(`Expected skill template at ${path.join(sourceSkillDir, "SKILL.md")}`);
  }

  if (!existsSync(sourceRuntimePath)) {
    throw new Error(`Expected bundled runtime at ${sourceRuntimePath}. Run npm run build first.`);
  }

  const rl = promptEnabled()
    ? readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
    : null;

  const defaultTarget = path.resolve(getArg("--target") ?? process.cwd());
  const targetDir = rl ? path.resolve(await askText(rl, "Target repo path", defaultTarget)) : defaultTarget;
  const skillsDir = path.join(targetDir, ".agents", "skills");
  const claudeSkillsDir = path.join(targetDir, ".claude", "skills");
  const destinationSkillDir = path.join(skillsDir, "metabase-skill");
  const alreadyInstalled = existsSync(destinationSkillDir);
  const sourceDigest = digestDirectory(sourceSkillDir);
  const installedDigest = alreadyInstalled ? digestDirectory(destinationSkillDir) : null;
  const isUpToDate = alreadyInstalled && installedDigest === sourceDigest;

  if (isUpToDate) {
    ensureDirSymlink(path.join(claudeSkillsDir, "metabase-skill"), destinationSkillDir);

    rl?.close();
    process.stdout.write([
      "",
      `metabase-skill is already up to date at ${destinationSkillDir}`,
      "No other project files were modified.",
      ""
    ].join("\n"));
    return;
  }

  if (alreadyInstalled) {
    const replace = rl
      ? await askBoolean(rl, `Changes detected for ${destinationSkillDir}. Update it?`, true)
      : true;

    if (!replace) {
      rl.close();
      process.stdout.write("Install cancelled.\n");
      return;
    }
  }

  copySkill(sourceSkillDir, destinationSkillDir);
  ensureDirSymlink(path.join(claudeSkillsDir, "metabase-skill"), destinationSkillDir);

  rl?.close();

  const lines = [
    "",
    `${alreadyInstalled ? "Updated" : "Installed"} metabase-skill at ${destinationSkillDir}`
  ];
  lines.push(`Claude symlink: ${path.join(claudeSkillsDir, "metabase-skill")}`);

  lines.push("No other project files were modified.");
  lines.push("");

  process.stdout.write(lines.join("\n"));
}

await main();
