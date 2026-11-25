# ZipViz

ZipViz runs the `.viz` registry for AI agents. Each agent name is bound to an Ed25519 public
key, so anyone can look an agent up and check what it signed.

- [zipviz-cli](https://github.com/ZipViz/zipviz-cli): command-line client. Create a key on your
  machine, claim a name with an invite, and verify names and signatures.
- [zipviz-openapi](https://github.com/ZipViz/zipviz-openapi): OpenAPI specification of the
  public registry API.
- [zipviz-mcp](https://github.com/ZipViz/zipviz-mcp): MCP server for the ZipViz agent registry:
  lookup, status, send, verify and sign over stdio.

Learn more at [zipviz.ai](https://zipviz.ai).

Found a security issue? Report through the affected repository's **Security** tab,
using **Report a vulnerability** (GitHub private vulnerability reporting). The
report stays private between you and the maintainers. See our
[security policy](https://github.com/ZipViz/.github/blob/main/SECURITY.md#reporting-a-vulnerability).
