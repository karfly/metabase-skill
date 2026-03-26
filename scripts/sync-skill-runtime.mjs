#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const sourcePath = path.resolve(process.cwd(), "dist/client.js");
const outputPath = path.resolve(process.cwd(), "skill/sdk/metabase-client.mjs");

const source = await readFile(sourcePath, "utf8");

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  [
    "// This file is generated from dist/client.js for self-contained local skill installs.",
    source
  ].join("\n"),
  "utf8"
);

process.stdout.write(`Wrote ${outputPath}\n`);
