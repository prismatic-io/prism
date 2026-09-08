# Initial incur port review

This records the initial three-branch review. The subsequent native implementation and
current compatibility scope are documented in [Native incur adoption](incur-native-adoption.md).
Its runtime limitations supersede the historical ones below.

The stack targets Prism 11 while preserving the human CLI contract of the npm-published
`@prismatic-io/prism@10.2.0`. It uses incur 0.5.1. The published tarball's 91 command
definitions match `test/fixtures/legacy-cli-contract.json` exactly.

## Review boundaries

- `incur-port`: routing and parser compatibility, native incur discovery, agent execution,
  authentication streaming, MCP transport isolation, execution events, and mutation guards.
- `incur-codegen-v6`: generated typed GraphQL documents, explicit missing-parent errors,
  and code-generation token capture independent of agent output mode.
- `incur-agent-contracts`: named resource results and schemas, native table values and IDs,
  preserved warnings, shell-safe follow-up commands, and reproducible live audit scripts.

The release/help/Node changes previously stacked above the original port are incorporated
in `incur-port`. The minimum runtime is Node 22; native incur help is an intentional major
version presentation change. Unrelated existing API, polling, and result-file defects were
kept outside this work.

## Compatibility and execution checks

Tests assert actual parsed values for each legacy option and short alias, not only parser
acceptance. Differential probes against the published executable cover colon and space
routes, attached short values, space-separated arrays, local `-v` and `-h` ownership,
missing values, `--help`, positional booleans, literal marker-like arguments, and delimiter
passthrough. Option values are never interpreted as command paths. The published global
`--help` preemption remains available; command-local `-h` continues to mean its local option.

Agent errors have stable status and structured output across JSON, JSONL, and TOON. Subprocess
stdout/stderr cannot corrupt JSON or MCP framing, and failed subprocess diagnostics are bounded.
Nested calls retain agent state, confirmation state, warnings, and the output sink. Streams emit
typed execution, log, step-result, listening, and saved-payload events without replaying their
transcripts. Native CLI and MCP tests check streaming failures through incur itself.

The static mutation classification includes availability and marketplace updates. Dynamic
GraphQL mutation detection still allows queries in read-only mode. Agent prerequisites are
checked before enabling remote listening, and cleanup is active once listening starts.
MCP/HTTP command calls cannot consume shared process stdin; ordinary CLI pipes still work.

Independent subagents performed initial and adversarial reviews, implementation reviews
across each other's changes, and final framework-entrypoint probes. Reproductions prompted
additional checks for shell completion, native built-in routes, typed result warnings,
CTA quoting, and MCP generator completion semantics.

## Agent results

Tables retain native values and include identifiers by default. Human table, CSV, YAML, and
legacy JSON rendering remains unchanged. Explicit projections and legacy string-based
filtering/sorting continue to work. Resource mutations and exports return named IDs,
definitions, or paths. Identity output excludes authentication tokens; token commands expose
only the explicitly requested token. Declared schemas include optional warning messages.

GraphQL extraction was compared structurally: all 94 migrated inline documents preserve
operations after removing operation names. Missing nullable parents now fail with `NOT_FOUND`;
existing parents with zero children still return successful empty lists.

## Live validation

`test/fixtures/live-cli-audit.json` records hashes/counts from the development stack. It covers
24 resource-list commands in human and agent modes, identity output, and seven bounded/resumable
pagination cases: 56 matched checks. Agent data is rendered using the legacy cell representation
before comparing it with the published CLI. No credentials or returned customer data are stored.

`test/fixtures/live-cli-lifecycle.json` records create/update/delete validation on both release
and port, including spaced label arrays, GraphQL's `-v` variables alias, and attached `-n=value`.
Temporary customers use unique audit names and external IDs and are removed in `finally`.
An independent query verifies that no audit customers remain. The API's existing lowercase
label normalization is accounted for in the comparison.

Reproduce against an explicitly selected development stack:

```sh
PRISMATIC_URL=https://app.example.prismatic-dev.io node scripts/audit-live-readonly.mjs
PRISMATIC_URL=https://app.example.prismatic-dev.io PRISM_AUDIT_MUTATIONS=true node scripts/audit-live-lifecycle.mjs
```

`PRISM_LEGACY_BIN` and `PRISM_CANDIDATE_BIN` can select alternate executables. The lifecycle
script refuses non-development hosts and modifies only the customers it creates. The
read-only script reports absent fixtures and unavailable baseline operations separately
from matches; those cases are not treated as validation coverage.

## Runtime boundaries

Authentication still requires the existing browser/PKCE interaction. Default agent CLI output
and explicit JSONL deliver the challenge immediately. Unauthenticated MCP or buffered-format
login returns `AUTHENTICATION_REQUIRED` before opening a listener, with instructions to
bootstrap an authenticated profile. Authentication timeouts and stream cancellation close
the listener. No new background authentication daemon or unverified OAuth grant was added.

The adapter retains its execution lock because inherited command handlers change the process
working directory and environment. A long-running operation can serialize other operations
within one MCP process. CLI/HTTP generator cancellation reaches polling, subprocesses, and
authentication, but incur 0.5.1 does not forward MCP cancellation to command handlers.
Subprocess output is captured until the child exits. These limitations are explicit; the port
does not claim concurrent MCP execution or incremental subprocess output.

The bundled CLI declares the dynamically imported MCP server as a direct runtime dependency,
so package managers do not need to hoist incur's transitive dependencies for MCP to start.
Packed-package checks include actual production dependency installation and a stdio MCP
initialize/tools-list exchange.

## Final verification

The final integrated build passes formatting, linting, TypeScript compilation, bundling,
and installed CLI smoke checks. The full suite passes 750 tests with three skipped tests.
Full suites also passed on Node 22.23.2 and 26.4.0 before the final native-command guard
and completion additions; those additions receive focused subprocess checks on both runtimes.
The minimum Node 22.0.0 runtime is covered by the installed CLI smoke check.

This substantially adopts incur's agent-facing features: discovery, schemas, structured
results, follow-up commands, streaming, MCP, skills, and completion. It does not eliminate
every legacy abstraction: the compatibility descriptor adapter retains some `any` types
and does not provide full end-to-end inference from incur command declarations.
