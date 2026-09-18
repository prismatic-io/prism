# Prism 11 command-line changes

This document lists the differences in the public command-line surface between Prism 10 (`@prismatic-io/prism@10.4.0`) and Prism 11 (`@prismatic-io/prism@11.0.0`). It is for tools and scripts that call `prism` as a subprocess.

The comparison was made from the generated command manifest of Prism 10 and the command contract of Prism 11. Every Prism 10 command, argument, option, short alias, default value, and enum value is still present in Prism 11 unless this document says otherwise.

## Summary

- No command was removed. No argument was removed. No short alias changed.
- Four per-command confirmation flags were removed. The global `--yes` flag replaces them.
- Nineteen commands were added. Most of them explore the component catalog, or search executions and logs.
- Several commands got new optional flags. Existing flags keep their meaning.
- The CLI framework changed from oclif to incur. Help text, version text, and error text look different. Exit codes for usage errors did not change.
- Prism 11 has an agent mode. It switches on automatically when specific environment variables are present. In agent mode, output and error formats change, and mutating commands need `--yes`.
- Node.js 22 or later is required. Prism 10 accepted Node.js 20.

## Invocation

| Topic | Prism 10 | Prism 11 |
| --- | --- | --- |
| Command separator | Colon only: `prism customers:list` | Colon or space: `prism customers:list` and `prism customers list` |
| Help command | `prism help customers:list` | Same. Also `prism customers list --help` |
| `-h` | Rejected as an unknown flag | Shows help |
| `--version` output | `@prismatic-io/prism/10.4.0 darwin-arm64 node-v24.19.0` | `11.0.0` |
| `-v` | Rejected: `command -v not found` | Prints the version |
| Option name case | Declared name only, for example `--commitHash` | Declared name and kebab-case name both work: `--commitHash`, `--commit-hash` |
| `--no-header`, `--no-truncate` | Only the negated form exists | Negated form still works. Positive forms `--header` and `--truncate` also work |
| `--flag=value` and attached short values (`-cvalue`) | Supported | Supported |
| Child command after `--` (`components:dev:run`) | Supported | Supported. The words after `--` are passed through byte for byte |

## Global flags

Kept from Prism 10:

| Flag | Notes |
| --- | --- |
| `--print-requests` | Unchanged |
| `--profile <name>` | Unchanged. `PRISM_PROFILE` still applies |
| `--quiet` | Unchanged. `PRISM_QUIET` still applies |

New in Prism 11:

| Flag | Meaning |
| --- | --- |
| `--yes` | Approve every confirmation prompt. Replaces the removed `--confirm` and `--no-prompt` flags |
| `--read-only` | Reject any command that can modify remote state. Exit code 2, error code `READ_ONLY` |
| `--agent` / `--no-agent` | Force agent mode on or off. See "Agent mode" |
| `--format <toon\|json\|yaml\|md\|jsonl>` | Output format for the structured envelope. Only affects agent mode and the built-in incur routes |
| `--json` | Shorthand for `--format json`. Prints the structured envelope even in human mode. `--yaml`, `--toon`, and `--md` shorthands do not exist |
| `--filter-output <keys>` | Filter structured output by key paths |
| `--full-output` | Show the full output envelope |
| `--token-count`, `--token-limit <n>`, `--token-offset <n>` | Token accounting for structured output |
| `--schema` | Print the JSON Schema of a command |
| `--llms`, `--llms-full` | Print an LLM-readable manifest |
| `--mcp` | Serve the CLI as an MCP server over stdio |
| `--update`, `--update-check` | Install or check for a newer Prism release |

Global flags can appear before or after the command in both versions.

## New top-level routes

incur adds three routes that Prism 10 did not have. They are not Prismatic commands and they do not call the Prismatic API.

| Route | Purpose |
| --- | --- |
| `prism completions` | Generate a shell completion script |
| `prism mcp add`, `prism mcp doctor` | Register Prism as an MCP server |
| `prism skills add`, `prism skills list` | Sync skill files to coding agents |

The `prism autocomplete [shell] [-r|--refresh-cache]` and `prism autocomplete:script <shell>` commands from the Prism 10 autocomplete plugin are still present.

## Environment variables

Honored in both versions: `PRISMATIC_URL`, `PRISM_PROFILE`, `PRISM_CONFIG_FILE`, `PRISM_ACCESS_TOKEN`, `PRISM_REFRESH_TOKEN`, `PRISMATIC_TENANT_ID`, `PRISM_QUIET`, `PRISMATIC_PRINT_REQUESTS`, `HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY`.

New in Prism 11:

| Variable | Effect when set to `1` or `true` |
| --- | --- |
| `PRISM_AGENT`, `PRISM_AGENT_MODE`, `FORCE_AGENT_MODE` | Force agent mode on |
| `PRISM_NO_AGENT`, `FORCE_HUMAN_MODE` | Force agent mode off |
| `PRISM_READ_ONLY` | Same as `--read-only` |

Prism 11 also switches agent mode on when any of these variables is `1` or `true`: `CLAUDE_CODE`, `CLAUDECODE`, `CURSOR_AGENT`, `CODEX`, `OPENAI_CODEX`, `AIDER`, `CLINE`, `WINDSURF_AGENT`, `GITHUB_COPILOT`, `AMAZON_Q`, `AWS_Q_DEVELOPER`, `GEMINI_CODE_ASSIST`, `SRC_CODY`, `PI_CODING_AGENT`.

A wrapper that must keep Prism 10 output behavior must set `PRISM_NO_AGENT=1` or pass `--no-agent`. Explicit flags win over environment variables.

## Agent mode

Agent mode changes the contract in these ways:

- Output is a structured envelope on stdout. The default format is TOON. Use `--format json` for JSON.
- Table flags such as `--output json`, `--csv`, and `--columns` are ignored. The structured envelope is printed instead.
- List commands return one page of results and a `pageInfo` cursor. Pass `--all` to fetch every page. In human mode, list commands still fetch every page as Prism 10 did.
- Errors are written to stdout as a structured object with `code`, `message`, and `retryable` fields. Usage errors exit with 2. Other errors exit with 1.
- Every command that can modify state requires `--yes`. Without it, the command exits with 2 and error code `CONFIRMATION_REQUIRED`.
- Interactive prompts are never shown. A command that needs one fails with code `INTERACTIVE_INPUT_REQUIRED` or `CONFIRMATION_REQUIRED`.
- `process.stdout.isTTY` is reported as false to the command.

## Confirmation prompts

Prism 10 gave each prompting command its own flag. Prism 11 uses the global `--yes` flag for all of them.

| Command | Prism 10 flag | Prism 11 |
| --- | --- | --- |
| `components:publish` | `--confirm` / `--no-confirm` (default `--confirm`) | Flag removed. Pass `--yes` to skip the prompt |
| `integrations:import` | `--confirm` / `--no-confirm` (default `--confirm`) | Flag removed. Pass `--yes` to skip the prompt |
| `me:token:revoke` | `--confirm` / `--no-confirm` (default `--confirm`) | Flag removed. Pass `--yes` to skip the prompt |
| `integrations:flows:listen` | `--no-prompt` (`-n`) | Flag removed. Pass `--yes` to skip the poll prompt. `-n` now belongs only to `--flow-name` |

Passing a removed flag fails with exit code 2 and error code `UNKNOWN_FLAG`.

Prompt behavior without a terminal also changed. Prism 10 tried to read the answer from stdin. Prism 11 refuses to prompt when stdin is not a TTY, and fails with exit code 2 and error code `CONFIRMATION_REQUIRED`. Wrappers that run these commands must pass `--yes`.

## Exit codes and error output

| Situation | Prism 10 | Prism 11 |
| --- | --- | --- |
| Unknown command | Exit 2. Stderr: ` ›   Error: command X not found` | Exit 2. Stderr: `Error: 'X' is not a command for 'prism'.` Stdout gets a "Suggested command" hint |
| Unknown flag | Exit 2. Stderr: ` ›   Error: Nonexistent flag: --x` plus usage | Exit 2. Stderr: `Error: Unknown flag: --x` and `Code: UNKNOWN_FLAG` |
| Missing required argument | Exit 2. Stderr: ` ›   Error: Missing 1 required arg` plus usage | Exit 2. Stderr: `Error: missing required argument <name>` plus usage |
| Mutually exclusive flags | Exit 2 | Exit 2. Message: `--a cannot also be provided when using --b` |
| Runtime or API failure | Exit 1. Stderr: ` ›   Error: message` | Exit 1. Stderr: `Error (CODE): message`, for example `Error (AUTHENTICATION_REQUIRED): ...` |
| Help | Exit 0, stdout | Exit 0, stdout |

Do not parse the ` ›   Error:` prefix. It no longer appears.

Help text layout changed completely. Do not parse help output.

## New commands

Component catalog:

| Command | Arguments | Options |
| --- | --- | --- |
| `components:get <componentKey>` | | `--public`, `--private`, `--version <int>` |
| `components:search <terms>` | | table flags, `--kind`/`-k <all\|components\|actions\|triggers\|data-sources>` (default `all`), `--category`, `--context`, `--public`, `--private` |
| `components:versions <componentKey>` | | table flags, `--after`, `--all`, `--first`, `--public`, `--private` |
| `components:actions:get <componentKey> <actionKey>` | | `--public`, `--private`, `--version <int>` |
| `components:triggers:get <componentKey> <triggerKey>` | | `--public`, `--private`, `--version <int>` |
| `components:data-sources:get <componentKey> <dataSourceKey>` | | `--public`, `--private`, `--version <int>` |
| `components:connections:list <componentKey>` | | table flags, `--public`, `--private`, `--version <int>` |
| `components:connections:get <componentKey> <connectionKey>` | | `--public`, `--private`, `--version <int>` |

Executions and logs:

| Command | Arguments | Options |
| --- | --- | --- |
| `executions:list` | | table flags, `--after`, `--all`, `--first`, `--since`, `--until`, `--instance`, `--customer`, `--integration`, `--flow`, `--includeTests`, `--status`/`-S`, `--result`, `--invokeType`, `--error`, `--payload` (repeatable), `--where`/`-w` (repeatable), `--orderBy` (default `startedAt`), `--desc` (default true) |
| `executions:count` | | `--since`, `--until`, `--instance`, `--customer`, `--integration`, `--flow`, `--includeTests`, `--status`, `--where`/`-w` |
| `executions:fields` | | table flags, `--since`, `--until`, `--search`/`-s`, `--instance`, `--customer`, `--integration` |
| `executions:get <executionId>` | | |
| `executions:steps <executionId>` | | table flags, `--after`, `--all`, `--first`, `--direction <asc\|desc>` (default `asc`), `--failed`, `--where`/`-w` |
| `executions:logs <executionId>` | | table flags, `--after`, `--all`, `--first`, `--direction` (default `asc`), `--severity`, `--message`/`-m`, `--step`, `--where`/`-w` |
| `logs:list` | | table flags, `--after`, `--all`, `--first`, `--since`, `--until`, `--instance`, `--customer`, `--integration`, `--flow`, `--includeTests`, `--direction` (default `desc`), `--execution`, `--severity`, `--message`/`-m`, `--type`, `--where`/`-w` |

Code Native Integration manifests:

| Command | Arguments | Options |
| --- | --- | --- |
| `integrations:manifests:add <componentKeys...>` | required | `--public`, `--private`, `--register` (default true, `--no-register` to skip) |
| `integrations:manifests:list` | | table flags |

The `--status` enum for `executions:list` and `executions:count` is `pending`, `success`, `error`, `queued`, `canceling`, `canceled`.

"Table flags" means the Prism 10 table flag set: `--columns`, `--csv`, `--extended`/`-x`, `--filter`, `--no-header`, `--no-truncate`, `--output <csv|json|yaml>`, `--sort`.

## Changed commands

All changes below are additions. Existing flags, arguments, defaults, and enums are unchanged unless stated.

### Pagination flags on list commands

These commands got `--after <cursor>`, `--all`, and `--first <int>`:

`alerts:groups:list`, `alerts:monitors:list`, `alerts:webhooks:list`, `components:list`, `components:actions:list`, `components:data-sources:list`, `components:triggers:list`, `customers:list`, `customers:users:list`, `instances:list`, `instances:config-vars:list`, `instances:flow-configs:list`, `integrations:list`, `integrations:flows:list`, `on-prem-resources:list`, `organization:users:list`.

In human mode these commands still fetch every page by default. In agent mode they return one page unless `--all` is given.

### Other flag additions

| Command | Added |
| --- | --- |
| `components:list` | `--category <string>`, `--dataSourceType <string>`, `--fulltext <string>`, `--hasActions`, `--hasConnections`, `--hasDataSources`, `--hasTriggers`, `--public`, `--private` (`--public` and `--private` are mutually exclusive) |
| `components:actions:list` | `--search`/`-s <string>`, `--version <int>` |
| `components:triggers:list` | `--search`/`-s <string>`, `--version <int>` |
| `components:data-sources:list` | `--search`/`-s <string>`, `--type <string>`, `--version <int>` |
| `components:actions:list`, `components:triggers:list`, `components:data-sources:list` | `--public` and `--private` are now declared mutually exclusive |
| `components:publish` | `--wait` (default true, `--no-wait` to return after submit), `--wait-timeout <seconds>` (default 300). The command now blocks until the version is available |
| `integrations:import` | `--wait` (default true, `--no-wait` to return after import), `--wait-timeout <seconds>` (default 300). The command now blocks until a Code Native Integration is ready to run |
| `integrations:publish` | `--wait` (default true), `--wait-timeout <seconds>` (default 300) |
| `components:dev:test` | `--action <key>`, `--action-inputs <json>`, `--connection <key>`, `--connection-inputs <json>`. Used in agent mode instead of interactive prompts |
| `components:dev:run` | Declared positional `command...` for the words after `--`. Usage did not change |
| `login`, `login:switch` | `--tenant-id <id>` to select a tenant without a prompt |
| `customers:users:update` | `--dark-mode` and `--dark-mode-os-sync` now declare the enum `true|false`. Other values were already rejected at runtime |

### Text-only changes

- Descriptions of the `--no-header` and `--no-truncate` table flags changed. Behavior is the same.
- Several topic descriptions changed, for example `components` and `executions`.
- Help output for positional arguments uses the camelCase declared name, for example `<alertMonitorId>` instead of `ALERTMONITORID`.

## Removed

- Flags: `components:publish --confirm`, `integrations:import --confirm`, `me:token:revoke --confirm`, `integrations:flows:listen --no-prompt`. See "Confirmation prompts".
- The oclif ` ›   Warning: prism update available` text is gone. incur prints its own "Update available" notice in human mode only, and adds the `--update` and `--update-check` global flags.
- The `@prismatic-io/prism/<version> <platform> node-<version>` version banner is gone.

## Checklist for wrappers

1. Require Node.js 22 or later.
2. Set `PRISM_NO_AGENT=1` in the child environment, or pass `--no-agent`, unless you want structured output.
3. Replace `--no-confirm` and `--no-prompt` with the global `--yes`. Pass `--yes` to every mutating command that runs without a terminal.
4. Stop parsing `--version` output as a banner. It is now the bare semantic version.
5. Stop matching the ` ›   Error:` prefix. Match exit codes instead: 2 for usage and confirmation errors, 1 for runtime errors.
6. If you time out publishes or imports, note that `components:publish`, `integrations:publish`, and `integrations:import` now wait up to 300 seconds by default. Pass `--no-wait` for the old return-on-submit behavior.
