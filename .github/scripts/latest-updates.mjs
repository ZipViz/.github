#!/usr/bin/env node
// Rewrites the "Latest updates" block in profile/README.md: the last five
// releases and the last five merged pull requests across the public ZipViz
// repositories. Only the text between the two markers changes, and the output
// depends only on that data, so an unchanged week gives an unchanged file.
//
//   node .github/scripts/latest-updates.mjs [--check]
//
// --check exits 1 when the file would change, without writing it.

import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const OWNER = "ZipViz";
export const REPOS = ["zipviz-mcp", "zipviz-cli", "zipviz-openapi"];
export const README = "profile/README.md";
export const START = "<!-- latest-updates:start -->";
export const END = "<!-- latest-updates:end -->";
const LIMIT = 5;

/** DD/MM/YYYY in Australia/Sydney. */
export function formatDate(iso) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Australia/Sydney", day: "2-digit", month: "2-digit", year: "numeric" }).formatToParts(new Date(iso));
  const get = (type) => parts.find((p) => p.type === type).value;
  return `${get("day")}/${get("month")}/${get("year")}`;
}

/** A title safe to put in a Markdown list: single-spaced, no em or en dashes, no HTML, no live @mentions, no link brackets. */
export function cleanText(text) {
  return String(text)
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s*[\u2014\u2013]\s*/g, ", ")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/[[\]]/g, (c) => `\\${c}`)
    .replace(/(^|[^\w`])@([A-Za-z0-9][\w-]*(?:\/[\w.-]+)?)/g, "$1`@$2`");
}

const isBot = (pr) => pr.user?.type === "Bot" || /\[bot\]$/.test(pr.user?.login ?? "");

/** Newest first, ties broken by repository and number so the order never flips between runs. */
const newestFirst = (a, b) => b.date.localeCompare(a.date) || a.repo.localeCompare(b.repo) || b.number - a.number;

/**
 * The block between the markers. `releases` and `pulls` are the raw API items,
 * each tagged with its `repo`. Drafts, unmerged and bot pull requests are left out.
 */
export function buildBlock({ releases, pulls }) {
  const rel = releases
    .filter((r) => !r.draft && r.published_at)
    .map((r) => ({ repo: r.repo, date: r.published_at, number: 0, line: `- [${r.repo} ${cleanText(r.tag_name)}](${r.html_url}), ${formatDate(r.published_at)}` }))
    .sort(newestFirst)
    .slice(0, LIMIT);
  const prs = pulls
    .filter((p) => p.merged_at && !isBot(p))
    .map((p) => ({ repo: p.repo, date: p.merged_at, number: p.number, line: `- ${p.repo}: ${cleanText(p.title)} ([#${p.number}](${p.html_url})), ${formatDate(p.merged_at)}` }))
    .sort(newestFirst)
    .slice(0, LIMIT);
  const lines = ["## Latest updates", "", "Releases:", ""];
  lines.push(...(rel.length ? rel.map((r) => r.line) : ["- No releases yet."]));
  lines.push("", "Merged pull requests:", "");
  lines.push(...(prs.length ? prs.map((p) => p.line) : ["- None yet."]));
  return lines.join("\n");
}

/** Replaces the text between the markers; throws if they are missing or out of order. */
export function replaceBlock(readme, block) {
  const start = readme.indexOf(START);
  const end = readme.indexOf(END);
  if (start < 0 || end < 0 || end < start || readme.indexOf(START, start + 1) >= 0 || readme.indexOf(END, end + 1) >= 0) {
    throw new Error(`${README} needs exactly one ${START} followed by one ${END}`);
  }
  return `${readme.slice(0, start + START.length)}\n${block}\n${readme.slice(end)}`;
}

async function api(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub API GET ${path}: HTTP ${res.status}`);
  return res.json();
}

async function main() {
  const check = process.argv.includes("--check");
  const releases = [];
  const pulls = [];
  for (const repo of REPOS) {
    for (const r of await api(`/repos/${OWNER}/${repo}/releases?per_page=${LIMIT}`)) releases.push({ ...r, repo });
    // Most recently updated closed pull requests; merged ones among them are the newest merges.
    for (const p of await api(`/repos/${OWNER}/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=30`)) pulls.push({ ...p, repo });
  }
  const before = readFileSync(README, "utf8");
  const after = replaceBlock(before, buildBlock({ releases, pulls }));
  if (after === before) {
    console.log(`${README} is up to date.`);
    return;
  }
  if (check) {
    console.log(`${README} would change.`);
    process.exit(1);
  }
  writeFileSync(README, after);
  console.log(`Updated ${README}.`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((err) => {
    console.error(`latest-updates: ${err.message}`);
    process.exit(1);
  });
}
