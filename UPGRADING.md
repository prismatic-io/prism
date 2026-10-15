# Prism 11 changes

Compared with Prism **10.6.0**, audited October 13, 2026. This describes the release candidate with the review fixes applied; it does not imply those fixes have landed on `next` or that v11 has been published.

## Compatibility

All 91 v10 command IDs and positional arguments remain. Headless integration scaffolding (`integrations:init --configuration-type hosted|headless`) and recent component/configuration metadata and execution-section logging are included.

Human list tables retain their v10 default/extended columns and `--output json|csv|yaml` formats. Component member lists retain `componentid` and `componentkey`; richer catalog columns remain available through explicit `--columns` and agent output. Human JSON table cells remain strings.

Resource create/update/publish commands retain bare IDs, resource deletes retain silent success, `me` retains label lines on stdout, and integration/workflow exports retain raw YAML. Signatures, registration JWTs, private keys, and stdout translations retain their raw human values. Flow tests retain human response output and unwrapped `--jsonl` log/step records. Explicit `--json`/`--format` selects structured results without implicitly enabling agent behavior or mixing a second human result into stdout. Some informational commands (including profile management, scaffolding, component publication, token revocation, validation, and login/listening) still return named results or events; status/progress may appear on stderr.

## Changes requiring attention

- **Node.js 22.19.0+** replaces Node 20 support.
- `--confirm` on `components:publish`, `integrations:import`, and `me:token:revoke` is removed. Use global `--yes` to approve prompts; `--no-confirm` remains an alias for `--yes` only on `components:publish` and `integrations:import` in non-agent CLI invocations (including CI/CD). Agent mode requires `--yes`; MCP uses `context.yes`.
- `integrations:flows:listen --no-prompt` is removed; use `--yes`. Its old conflicting `-n` alias belongs to `--flow-name`.
- Without a terminal, commands refuse interactive confirmation; use `--yes`. Agent mode requires it for every marked mutation, including local writes.
- Help, errors, completion, and version formatting change with the CLI framework. `--version` returns a bare version. Usage errors exit 2; runtime errors exit 1. Human errors use stderr; agent errors are structured on stdout.
- Colon commands remain supported. Space-form subcommands now execute (v10.6.0 printed topic help in the audited cases). `-h` and `-v` are additive global shortcuts except where a command owns the alias. CamelCase flags also accept kebab-case spellings.
- Publication/import now waits for availability by default. `--no-wait` skips standalone publication waits and final import readiness; CNI imports still await component publication. `--wait-timeout` defaults to 300 seconds per stage. A timeout can follow a successful write.

## Agent and structured output

`--agent` enables structured output and resumable pagination; `--no-agent` or `PRISM_NO_AGENT=1` disables automatic agent behavior. Agent-related environment variables can enable it automatically. Explicit flags take precedence.

- Use `--agent --json` for typed named results; tables return `{items, pageInfo}` where paginated. Results may include warnings and follow-up suggestions. `--full-output` includes the envelope.
- Human lists fetch all pages; agent lists return a page. Use `--all`, `--first`, and `--after` where supported. `--columns`, `--filter`, and `--sort` apply in both modes.
- `--output json|csv|yaml` controls legacy human tables; `--json`/`--format` controls native result serialization. They are different contracts.
- Streams support `--format jsonl`; JSON/YAML/TOON buffer until completion. Authenticate before buffered login or MCP.
- `--read-only` / `PRISM_READ_ONLY=1` rejects remote mutations and local writes. MCP controls are supplied under `context`; inherited read-only mode cannot be disabled by a tool call.
- Signing-key generation in agent mode requires `--private-key-file <new-path>`; the file is private and existing files are not overwritten.

## Additions

Compatibility repairs preserve v11 additions and correctness fixes. Synchronous flow responses accept any JSON value.

26 Prismatic commands were added, plus two autocomplete compatibility entries formerly provided by a plugin:

- Component catalog: `components:get`, `search`, `versions`, member `get` commands, and `connections:list/get`.
- Execution inspection: `executions:count`, `fields`, `get`, `list`, `logs`, `steps`; also `logs:list`.
- CNI tooling: `integrations:manifests:add/list` and local `integrations:validate`.
- Organization themes: `organization:theme:get`, `color:set/reset`, `border-radius:set/reset`, and `elevation:enable/disable/reset`. Changes require an explicit variant and preserve unrelated settings.

Catalog search/version/visibility filters, noninteractive component-development inputs, signing-key file output, and structured command schemas are additive. Run `<command> --help` or `<command> --schema` for exact options.
