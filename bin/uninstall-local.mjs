#!/usr/bin/env node

import { existsSync, lstatSync, readdirSync, rmSync, unlinkSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";

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

async function askBoolean(rl, label, defaultValue) {
  const suffix = defaultValue ? " [Y/n]" : " [y/N]";
  const answer = (await rl.question(`${label}${suffix}: `)).trim().toLowerCase();

  if (!answer) {
    return defaultValue;
  }

  return answer === "y" || answer === "yes";
}

function lstatSafe(filePath) {
  try {
    return lstatSync(filePath);
  } catch {
    return null;
  }
}

function removeIfExists(filePath) {
  const current = lstatSafe(filePath);

  if (current?.isSymbolicLink()) {
    unlinkSync(filePath);
    return true;
  }

  if (current) {
    rmSync(filePath, { recursive: true, force: true });
    return true;
  }

  return false;
}

function pruneEmptyDirs(startDir, stopDir) {
  let current = startDir;
  const resolvedStop = path.resolve(stopDir);

  while (path.resolve(current).startsWith(resolvedStop)) {
    if (path.resolve(current) === resolvedStop) {
      break;
    }

    if (!existsSync(current)) {
      current = path.dirname(current);
      continue;
    }

    if (!lstatSafe(current)?.isDirectory()) {
      break;
    }

    if (readdirSync(current).length > 0) {
      break;
    }

    rmSync(current, { recursive: true, force: true });

    current = path.dirname(current);
  }
}

async function main() {
  const rl = promptEnabled()
    ? readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
    : null;

  const targetDir = path.resolve(getArg("--target") ?? process.cwd());
  const skillsDir = path.resolve(getArg("--skills-dir") ?? path.join(targetDir, ".agents", "skills"));
  const claudeSkillsDir = path.resolve(getArg("--claude-skills-dir") ?? path.join(targetDir, ".claude", "skills"));
  const destinationSkillDir = path.join(skillsDir, "metabase-skill");
  const claudeSkillPath = path.join(claudeSkillsDir, "metabase-skill");
  const installed = existsSync(destinationSkillDir) || lstatSafe(destinationSkillDir);
  const claudeLink = lstatSafe(claudeSkillPath);

  if (!installed && !claudeLink) {
    rl?.close();
    process.stdout.write("metabase-skill is not installed here.\n");
    return;
  }

  if (rl) {
    const confirmed = await askBoolean(rl, `Uninstall metabase-skill from ${targetDir}?`, true);

    if (!confirmed) {
      rl.close();
      process.stdout.write("Uninstall cancelled.\n");
      return;
    }
  }

  const removed = [];

  if (removeIfExists(destinationSkillDir)) {
    removed.push(destinationSkillDir);
    pruneEmptyDirs(path.dirname(destinationSkillDir), targetDir);
  }

  const currentClaude = lstatSafe(claudeSkillPath);

  if (currentClaude) {
    removeIfExists(claudeSkillPath);
    removed.push(claudeSkillPath);
    pruneEmptyDirs(path.dirname(claudeSkillPath), targetDir);
  }

  rl?.close();

  const lines = ["", "Uninstalled metabase-skill."];

  if (removed.length > 0) {
    lines.push(...removed.map((item) => `Removed: ${item}`));
  }

  lines.push("No other project files were modified.");
  lines.push("");
  process.stdout.write(lines.join("\n"));
}

await main();
