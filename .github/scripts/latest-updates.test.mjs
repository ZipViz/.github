// Run with: node --test .github/scripts/latest-updates.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { END, EXIT_WOULD_CHANGE, START, buildBlock, cleanText, formatDate, replaceBlock } from "./latest-updates.mjs";

test("formatDate is DD/MM/YYYY in Sydney time", () => {
  assert.equal(formatDate("2026-11-18T08:55:49Z"), "18/11/2026");
  // 20:00 UTC on 18/11 is the next morning in Sydney.
  assert.equal(formatDate("2026-11-18T20:00:00Z"), "19/11/2026");
});

test("cleanText keeps list items plain and safe", () => {
  assert.equal(cleanText("Release 2.0.0 \u2014 tools"), "Release 2.0.0, tools");
  assert.equal(cleanText("Fix [link](x) <b>"), "Fix \\[link\\](x) &lt;b&gt;");
  assert.equal(cleanText("Thanks @someone"), "Thanks `@someone`");
});

const pr = (repo, number, title, merged_at, login = "person", type = "User") => ({ repo, number, title, merged_at, html_url: `https://github.com/ZipViz/${repo}/pull/${number}`, user: { login, type } });
const rel = (repo, tag_name, published_at, draft = false) => ({ repo, tag_name, published_at, draft, html_url: `https://github.com/ZipViz/${repo}/releases/tag/${tag_name}` });

test("buildBlock lists the newest five of each, across repositories, without bots, drafts or unmerged pull requests", () => {
  const pulls = [
    pr("zipviz-mcp", 11, "Release zipviz-mcp 2.0.0", "2026-11-18T08:55:49Z"),
    pr("zipviz-openapi", 2, "Add v1 signature test vectors", "2026-11-19T04:07:21Z"),
    pr("zipviz-cli", 14, "Use neutral wording", "2026-10-27T04:28:38Z"),
    pr("zipviz-cli", 12, "build(deps): bump x", "2026-11-19T09:00:00Z", "dependabot[bot]", "Bot"),
    pr("zipviz-cli", 13, "Closed without merging", null),
    pr("zipviz-cli", 9, "Older one", "2026-10-21T00:17:02Z"),
    pr("zipviz-cli", 8, "Older two", "2026-10-20T19:58:50Z"),
    pr("zipviz-cli", 7, "Oldest, dropped", "2026-10-17T04:47:19Z"),
  ];
  const releases = [rel("zipviz-mcp", "v2.0.0", "2026-11-19T01:00:00Z"), rel("zipviz-cli", "v0.2.0", null, true)];
  const block = buildBlock({ releases, pulls });
  assert.equal(
    block,
    [
      "## Latest updates",
      "",
      "Releases:",
      "",
      "- [zipviz-mcp v2.0.0](https://github.com/ZipViz/zipviz-mcp/releases/tag/v2.0.0), 19/11/2026",
      "",
      "Merged pull requests:",
      "",
      "- zipviz-openapi: Add v1 signature test vectors ([#2](https://github.com/ZipViz/zipviz-openapi/pull/2)), 19/11/2026",
      "- zipviz-mcp: Release zipviz-mcp 2.0.0 ([#11](https://github.com/ZipViz/zipviz-mcp/pull/11)), 18/11/2026",
      "- zipviz-cli: Use neutral wording ([#14](https://github.com/ZipViz/zipviz-cli/pull/14)), 27/10/2026",
      "- zipviz-cli: Older one ([#9](https://github.com/ZipViz/zipviz-cli/pull/9)), 21/10/2026",
      "- zipviz-cli: Older two ([#8](https://github.com/ZipViz/zipviz-cli/pull/8)), 21/10/2026",
    ].join("\n"),
  );
});

test("buildBlock leaves out an empty list instead of announcing it", () => {
  assert.equal(buildBlock({ releases: [], pulls: [] }), "## Latest updates");
  const block = buildBlock({ releases: [], pulls: [pr("zipviz-cli", 1, "First", "2026-10-01T00:00:00Z")] });
  assert.ok(!block.includes("Releases:"));
  assert.ok(block.includes("Merged pull requests:"));
});

test("replaceBlock rewrites only the text between the markers and is stable", () => {
  const readme = `# ZipViz\n\nIntro.\n\n${START}\nold\n${END}\n\nFooter.\n`;
  const once = replaceBlock(readme, "new block");
  assert.equal(once, `# ZipViz\n\nIntro.\n\n${START}\nnew block\n${END}\n\nFooter.\n`);
  assert.equal(replaceBlock(once, "new block"), once);
});

test("replaceBlock refuses a README without exactly one pair of markers", () => {
  assert.throws(() => replaceBlock("no markers", "x"));
  assert.throws(() => replaceBlock(`${END}\n${START}`, "x"));
  assert.throws(() => replaceBlock(`${START}${END}${START}${END}`, "x"));
});

// The script run as the workflow runs it, in a scratch directory holding only a README.
function runScript(readme) {
  const dir = mkdtempSync(join(tmpdir(), "latest-updates-"));
  try {
    mkdirSync(join(dir, "profile"));
    writeFileSync(join(dir, "profile", "README.md"), readme);
    const script = fileURLToPath(new URL("./latest-updates.mjs", import.meta.url));
    // An unroutable API host: if the script ever reached the network, it would fail differently.
    return spawnSync(process.execPath, [script, "--check"], { cwd: dir, encoding: "utf8",
      env: { PATH: process.env.PATH, HTTPS_PROXY: "http://127.0.0.1:9" } });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("a broken marker fails the job with exit 1, before any network call, never the would-change code", () => {
  for (const readme of ["# ZipViz\n\nno markers\n", `${END}\n${START}\n`, `${START}\n${END}\n${START}\n${END}\n`]) {
    const r = runScript(readme);
    assert.equal(r.status, 1, readme);
    assert.notEqual(r.status, EXIT_WOULD_CHANGE);
    assert.match(r.stderr, /needs exactly one/);
  }
});

test("expected drift has its own exit code", () => {
  assert.equal(EXIT_WOULD_CHANGE, 2);
});
