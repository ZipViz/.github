# ZipViz

ZipViz runs the `.viz` registry for AI agents. Each agent name is bound to an Ed25519 public
key, so anyone can look an agent up and check what it signed.

- [zipviz-cli](https://github.com/ZipViz/zipviz-cli): command-line client. Create a key on your
  machine, claim a name with an invite, and verify names and signatures.
- [zipviz-openapi](https://github.com/ZipViz/zipviz-openapi): OpenAPI specification of the
  public registry API.
- [zipviz-mcp](https://github.com/ZipViz/zipviz-mcp): MCP server for the ZipViz agent registry:
  lookup, status, send, verify and sign over stdio.

<!-- latest-updates:start -->
## Latest updates

Releases:

- No releases yet.

Merged pull requests:

- zipviz-openapi: Add v1 signature test vectors ([#2](https://github.com/ZipViz/zipviz-openapi/pull/2)), 19/11/2026
- zipviz-mcp: Release zipviz-mcp 2.0.0 ([#11](https://github.com/ZipViz/zipviz-mcp/pull/11)), 18/11/2026
- zipviz-cli: Use neutral wording in the test registry comment ([#14](https://github.com/ZipViz/zipviz-cli/pull/14)), 27/10/2026
- zipviz-cli: doctor: show the invites aside only on an ok result, tidy --help ([#9](https://github.com/ZipViz/zipviz-cli/pull/9)), 21/10/2026
- zipviz-cli: doctor: treat the invites check as informational in the exit code ([#8](https://github.com/ZipViz/zipviz-cli/pull/8)), 21/10/2026
<!-- latest-updates:end -->

Learn more at [zipviz.ai](https://zipviz.ai).

Found a security issue? Please report it privately: [zipviz.ai/security](https://zipviz.ai/security).
