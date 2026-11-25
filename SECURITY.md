# Security Policy

This is the default security policy for every repository in the ZipViz
organization. A repository with its own `SECURITY.md` uses that file instead.

## Reporting a vulnerability

Please report suspected vulnerabilities **privately**. Do not open a public issue,
discussion or pull request.

- Report through the repository's **Security** tab, using **Report a
  vulnerability** (GitHub private vulnerability reporting), or
- use our reporting page: <https://zipviz.ai/security>.

Include the affected package and version, what an attacker can do, and steps to
reproduce. We follow coordinated disclosure: we acknowledge your report and keep
you updated through remediation.

## Supported versions

Only the latest release of each package receives security fixes. A repository's
own `SECURITY.md` names its supported release line.

| Package | Repository | Supported |
| --- | --- | --- |
| `zipviz-mcp` (npm) | [zipviz-mcp](https://github.com/ZipViz/zipviz-mcp) | Latest release |
| `zipviz` (npm) | [zipviz-cli](https://github.com/ZipViz/zipviz-cli) | Latest 0.x release |
| ZipViz Registry API specification | [zipviz-openapi](https://github.com/ZipViz/zipviz-openapi) | Latest 1.x release |

Older releases do not receive fixes. Upgrade to the supported release to get one.

## How we handle a report

1. **Triage, in private.** We confirm the issue and its impact in a draft GitHub
   security advisory on the affected repository. Reports and discussion stay in
   the advisory, not in public issues.
2. **Fix, in private.** We develop and review the fix in the advisory's temporary
   private fork, so it is not public before release.
3. **Coordinated release.** We agree a disclosure date with the reporter, then
   publish the fixed release and the advisory together.
4. **Advisory and CVE.** We publish the GitHub security advisory (GHSA), which
   feeds `npm audit` and Dependabot alerts for downstream users, and request a CVE
   through GitHub when the issue warrants one.

Drill record: steps 1 and 2 (a draft advisory, its temporary private fork and a
branch pushed there, then closing the draft unpublished) were rehearsed on
25/11/2026. Steps 3 and 4 (a coordinated release, publishing the advisory and
requesting a CVE) were not exercised: both need a real vulnerability.

## Security releases

For each security release we:

- publish a patched version of every affected supported package;
- mark affected npm versions as deprecated with `npm deprecate`, pointing to the
  patched version; and
- state the fix, affected versions and upgrade steps in the release notes and the
  advisory.
