# Native incur adoption

The validated implementation below has been decomposed into a [reviewable PR stack](incur-pr-stack.md).

The `incur-native-commands` branch follows `incur-agent-contracts`. It replaces the
legacy command implementation while retaining the published commands, subcommands,
positional arguments, option names, short aliases, defaults, and option relationships.
Output presentation is allowed to follow incur's native behavior in Prism 11.

## Command implementation

Every public command declares native Zod inputs and an output schema. Handler inputs,
`c.ok()` calls, and handler returns are checked against those declarations. Compiled
negative type assertions prevent a future wrapper from silently erasing that inference.
Named table schemas retain their field types and pagination shape. A single documented
cast erases heterogeneous command types when mounting the dynamic command tree.

Native middleware establishes each invocation's profile, environment, signal, and runtime
state. Per-command declarations own mutation policy, output schemas, and examples. Domain
operations are ordinary functions; commands no longer call another command's legacy
`.invoke()` method or parse arrays through `.run(argv)`.

The remaining command helper binds native generators to their invocation's async context,
checks and normalizes results against their declared schemas, applies Prism's mutation
policy, and handles the upstream MCP globals gap described below. It does not collect
stdout into agent results, implement an alternate argument parser, or serialize commands
behind a process-wide execution lock.

## Public compatibility boundary

`src/compatibility.ts` derives compatibility metadata from Zod schemas. The CLI entrypoint
normalizes colon routes, historical camelCase names, attached aliases, spaced array values,
and opaque delimiter arguments before incur parses them. Boolean and variadic positional
arguments preserve native parser arity and expose meaningful schemas to MCP clients.

Incur formats returned domain data by default. Human status messages use stderr. Table
commands retain their dedicated renderer because `--columns`, `--filter`, `--sort`,
`--csv`, `--output`, `--no-header`, and `--no-truncate` are public behaviors. GraphQL's
formatting flags and completion-script output also retain their explicit renderers.
`--no-agent` selects human behavior; it does not restore Prism 10's scalar result format.

## Concurrent execution and streams

Prism no longer changes the process working directory or environment during command
execution. Generators, loaders, and subprocesses take explicit directories and environment
snapshots. Profile writes serialize per configuration file and replace files atomically;
independent read requests and different projects can run concurrently.

Login, flow tests, listening, and development subprocesses use native async generators.
They yield direct typed events, including completion, instead of nested message collectors.
Polling and listener cleanup are local to the generator. Development subprocess streams
apply backpressure, retain bounded failure diagnostics, and terminate children on cancellation.
One-shot build/scaffolding subprocesses retain their ordinary completion interface.

## Upstream verification

Checked npm and GitHub on September 8, 2026. npm's `latest` tag is **incur 0.5.1**, published
August 14. Installed and locked incur versions match. Upstream `main` is one workflow-only
commit ahead of that release, with no unreleased runtime fix to adopt.

- [Issue #229](https://github.com/wevm/incur/issues/229) remains open: globals are absent from
  MCP tool schemas and OpenAPI parameters. [PR #195](https://github.com/wevm/incur/pull/195)
  fixed CLI handler globals, not that transport gap. There is no documented supported
  forwarding mechanism or linked fix in the issue. Prism exposes optional `context`
  execution controls in each native tool input, avoiding incur's prohibition on options
  that shadow globals. MCP callers use `context.yes`, `context.profile`, and
  `context.readOnly`; CLI callers keep their existing global flags. MCP server launch
  defaults are captured per server, and an inherited read-only policy cannot be disabled
  by a tool call. The same declarations serve CLI, HTTP, and MCP.
- [Issue #188](https://github.com/wevm/incur/issues/188) covers eager variable-schema parsing
  before middleware. Prism declares middleware-populated variables optional and checks
  initialization before handler execution; it does not downgrade Zod.
- [PR #149](https://github.com/wevm/incur/pull/149) fixed CLI/HTTP stream terminal records.
  The installed MCP implementation still discards generator return values and does not
  forward MCP cancellation notifications to handlers. Prism yields completion data and
  throws native errors for stream failures. HTTP cancellation is tested separately.
- [Issue #225](https://github.com/wevm/incur/issues/225) describes the dynamic stdio SDK
  import problem in compiled binaries. Prism's npm bundle declares the SDK directly and
  verifies initialization from an installed packed package.
- [PR #233](https://github.com/wevm/incur/pull/233) raises incur's minimum TOON dependency.
  Prism's installed dependency and lockfile already resolve the patched TOON 2.3.1.

Remaining upstream limitations are MCP cancellation forwarding and reduced metadata on
MCP streaming errors. Authentication still uses the existing browser/PKCE flow; MCP callers
bootstrap a profile before starting the server. Executing user-supplied component code can
have arbitrary process side effects; Prism's own code no longer requires shared mutations.

## Verification

Tests exercise the actual native CLI, HTTP, and MCP entrypoints, including per-call approval,
profiles, read-only enforcement, concurrent invocation isolation, schema-normalized results,
streaming error semantics, listener cleanup, and subprocess cancellation. Contract tests
compare public inputs with the published Prism 10.2.0 manifest. Live comparison scripts
normalize identity presentation while comparing its underlying data; public table flags
are compared directly. Live lifecycle tests create and remove only temporary audit customers.

Final validation on September 8, 2026:

- Clean format, lint, TypeScript compilation, bundle, and installed CLI smoke checks.
- Final suite: **775 passed, 3 skipped**, across 47 test files on Node 24.19.0.
  The preceding full suite also passed on Node 22.23.2 and 26.4.0 (774 tests before
  the additional numeric log-severity regression). Minimum Node 22.0.0 smoke passed.
- Final packed npm artifact successfully initialized MCP and listed its discovery tools
  without stderr output. CLI, HTTP, and MCP context handling is covered by transport tests.
- **56 live read-only comparisons matched** published Prism 10.2.0 against
  `https://app.rwersal.prismatic-dev.io`; see
  [read-only evidence](../test/fixtures/live-native-readonly.json).
- **Two temporary-customer lifecycles passed**, including public aliases, create, update,
  and delete, with the final packed artifact; see
  [lifecycle evidence](../test/fixtures/live-native-lifecycle.json). A separate published-CLI
  query confirmed no audit customers remained.
