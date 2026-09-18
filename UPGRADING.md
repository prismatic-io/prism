# Prism 11 command-line changes

This document lists the differences in the public command-line surface between Prism 10 (`@prismatic-io/prism@10.5.0`) and the Prism 11 development tip (`next`, `3dd86795`, package version `11.0.0`). It is for tools and scripts that call `prism` as a subprocess.

Updated October 1, 2026. The comparison uses the published Prism 10.5.0 command manifest, the current Prism 11 command contracts, and live subprocess checks against `https://app.rwersal.prismatic-dev.io`. Prism 11 is a development build, not a claim about a published 11.0.0 release. The retained input surface is covered by contract tests; output compatibility has exceptions described below. See "Verification" for the live coverage and limits.

## Summary

- No command was removed. No argument was removed. Retained short aliases remain supported, except the removed listener `--no-prompt` alias described below.
- Four per-command confirmation flags were removed. The global `--yes` flag replaces them.
- Twenty-five Prismatic commands were added: seventeen catalog, execution, log, and manifest commands, plus eight organization theme commands. Two autocomplete compatibility commands also appear in the Prism 11 registry; they came from a plugin in Prism 10.
- Several commands got new optional flags, including pagination, publication waits, and private signing-key file output.
- Human command results can now be named objects rather than bare IDs or label lines. Disabling agent mode does not restore all old formatting.
- Component action, trigger, and data-source list columns changed, including JSON and CSV keys. This requires updates in consumers that select or read those columns.
- Embedded theming is additive: callers can read, set, and reset embedded light/dark colors, corner radius, and elevation independently of the team app theme.
- The CLI framework changed from oclif to incur. Help text, version text, and error text look different. Exit codes for usage errors did not change.
- Prism 11 has an agent mode. It switches on automatically when specific environment variables are present. In agent mode, output and error formats change, and mutating commands need `--yes`.
- Node.js **22.18.0 or newer** is required. Prism 10 accepted Node.js 20.

## Invocation

| Topic                                                | Prism 10                                                                                         | Prism 11                                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Command separator                                    | Colon and space forms both worked in live checks: `prism customers:list`, `prism customers list` | Both forms remain supported                                                    |
| Help command                                         | `prism help customers:list`                                                                      | Same. Also `prism customers list --help`                                       |
| `-h`                                                 | Rejected as an unknown flag                                                                      | Shows help                                                                     |
| `--version` output                                   | `@prismatic-io/prism/10.5.0 darwin-arm64 node-v24.21.0`                                          | `11.0.0`                                                                       |
| `-v`                                                 | Rejected: `command -v not found`                                                                 | Prints the version                                                             |
| Option name case                                     | Declared name only, for example `--commitHash`                                                   | Declared name and kebab-case name both work: `--commitHash`, `--commit-hash`   |
| `--no-header`, `--no-truncate`                       | Only the negated form exists                                                                     | Negated form still works. Positive forms `--header` and `--truncate` also work |
| `--flag=value` and attached short values (`-cvalue`) | Supported                                                                                        | Supported                                                                      |
| Child command after `--` (`components:dev:run`)      | Supported                                                                                        | Supported. The words after `--` are passed through byte for byte               |

## Global flags

Kept from Prism 10:

| Flag               | Notes                                    |
| ------------------ | ---------------------------------------- |
| `--print-requests` | Unchanged                                |
| `--profile <name>` | Unchanged. `PRISM_PROFILE` still applies |
| `--quiet`          | Unchanged. `PRISM_QUIET` still applies   |

New in Prism 11:

| Flag                                                       | Meaning                                                                                                                                                                                                          |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--yes`                                                    | Approve every confirmation prompt. Replaces the removed `--confirm` and `--no-prompt` flags                                                                                                                      |
| `--read-only`                                              | Reject commands marked as mutating, including local scaffolding, file writes, and profile changes. Exit code 2, error code `READ_ONLY`. GraphQL queries inspect the document and reject mutations                |
| `--agent` / `--no-agent`                                   | Force agent mode on or off. See "Agent mode"                                                                                                                                                                     |
| `--format <toon\|json\|yaml\|md\|jsonl>`                   | Select structured serialization. Use `--agent --format json` for consistent structured command results; legacy human-output commands may keep their own output policy                                            |
| `--json`                                                   | Shorthand for `--format json`. It selects serialization, not agent behavior: use `--agent --json` to enable structured list results and agent pagination. `--yaml`, `--toon`, and `--md` shorthands do not exist |
| `--filter-output <keys>`                                   | Filter structured output by key paths                                                                                                                                                                            |
| `--full-output`                                            | Include the full incur envelope and metadata; ordinary structured success output exposes the command data directly                                                                                               |
| `--token-count`, `--token-limit <n>`, `--token-offset <n>` | Token accounting for structured output                                                                                                                                                                           |
| `--schema`                                                 | Print the JSON Schema of a command                                                                                                                                                                               |
| `--llms`, `--llms-full`                                    | Print an LLM-readable manifest                                                                                                                                                                                   |
| `--mcp`                                                    | Serve the CLI as an MCP server over stdio                                                                                                                                                                        |
| `--update`, `--update-check`                               | Install or check for a newer Prism release                                                                                                                                                                       |

Global flags can appear before or after the command in both versions.

## New top-level routes

incur adds three routes that Prism 10 did not have. They are not Prismatic commands and they do not call the Prismatic API.

| Route                                   | Purpose                            |
| --------------------------------------- | ---------------------------------- |
| `prism completions`                     | Generate a shell completion script |
| `prism mcp add`, `prism mcp doctor`     | Register Prism as an MCP server    |
| `prism skills add`, `prism skills list` | Sync skill files to coding agents  |

The `prism autocomplete [shell] [-r|--refresh-cache]` and `prism autocomplete:script <shell>` commands from the Prism 10 autocomplete plugin are still present.

## Environment variables

Honored in both versions: `PRISMATIC_URL`, `PRISM_PROFILE`, `PRISM_CONFIG_FILE`, `PRISM_ACCESS_TOKEN`, `PRISM_REFRESH_TOKEN`, `PRISMATIC_TENANT_ID`, `PRISM_QUIET`, `PRISMATIC_PRINT_REQUESTS`, `HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY`.

New in Prism 11:

| Variable                                              | Effect when set to `1` or `true` |
| ----------------------------------------------------- | -------------------------------- |
| `PRISM_AGENT`, `PRISM_AGENT_MODE`, `FORCE_AGENT_MODE` | Force agent mode on              |
| `PRISM_NO_AGENT`, `FORCE_HUMAN_MODE`                  | Force agent mode off             |
| `PRISM_READ_ONLY`                                     | Same as `--read-only`            |

Prism 11 also switches agent mode on when any of these variables is `1` or `true`: `CLAUDE_CODE`, `CLAUDECODE`, `CURSOR_AGENT`, `CODEX`, `OPENAI_CODEX`, `AIDER`, `CLINE`, `WINDSURF_AGENT`, `GITHUB_COPILOT`, `AMAZON_Q`, `AWS_Q_DEVELOPER`, `GEMINI_CODE_ASSIST`, `SRC_CODY`, `PI_CODING_AGENT`.

To disable automatic agent behavior, set `PRISM_NO_AGENT=1` or pass `--no-agent`. Explicit flags win over environment variables. This controls prompts and pagination; it does **not** restore all Prism 10 output formats. See "Human command results".

## Agent mode

Agent mode changes the contract in these ways:

- Output is structured on stdout. The default format is TOON. Use `--agent --json` for JSON. Ordinary success output exposes command data directly (for example, `items` and `pageInfo`); `--full-output` adds the incur envelope and metadata. Results can include `warnings` and a suggested-command `cta`.
- Table serialization flags such as `--output json` and `--csv` do not replace agent serialization. `--columns`, `--filter`, and `--sort` still shape the returned items. Agent results include all available columns by default, with typed values rather than stringified table cells.
- List commands return one page of results and a `pageInfo` cursor. Pass `--all` to fetch every page. In human mode, list commands still fetch every page as Prism 10 did.
- Errors are written to stdout as a structured object with `code`, `message`, and `retryable` fields. Usage errors exit with 2. Other errors exit with 1.
- Every command marked as mutating (remote or local) requires `--yes`. Without it, the command exits with 2 and error code `CONFIRMATION_REQUIRED`.
- Interactive prompts are never shown. A command that needs one fails with code `INTERACTIVE_INPUT_REQUIRED` or `CONFIRMATION_REQUIRED`.
- `process.stdout.isTTY` is reported as false to the command.

## Confirmation prompts

Prism 10 gave each prompting command its own flag. Prism 11 uses the global `--yes` flag for all of them.

| Command                     | Prism 10 flag                                      | Prism 11                                                                                   |
| --------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `components:publish`        | `--confirm` / `--no-confirm` (default `--confirm`) | Flag removed. Pass `--yes` to skip the prompt                                              |
| `integrations:import`       | `--confirm` / `--no-confirm` (default `--confirm`) | Flag removed. Pass `--yes` to skip the prompt                                              |
| `me:token:revoke`           | `--confirm` / `--no-confirm` (default `--confirm`) | Flag removed. Pass `--yes` to skip the prompt                                              |
| `integrations:flows:listen` | `--no-prompt` (`-n`)                               | Flag removed. Pass `--yes` to skip the poll prompt. `-n` now belongs only to `--flow-name` |

Passing a removed flag fails with exit code 2 and error code `UNKNOWN_FLAG`.

Prompt behavior without a terminal also changed. Prism 10 tried to read the answer from stdin. Prism 11 refuses to prompt when stdin is not a TTY, and fails with exit code 2 and error code `CONFIRMATION_REQUIRED`. Wrappers must pass `--yes` when these commands reach a confirmation prompt. In human mode, non-prompting mutations can still run without `--yes`; in agent mode, every marked mutation requires it.

## Exit codes and error output

| Situation                 | Prism 10                                                        | Prism 11                                                                                          |
| ------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Unknown command           | Exit 2. Stderr: ` ›   Error: command X not found`               | Exit 2. Stderr: `Error: 'X' is not a command for 'prism'.` Stdout gets a "Suggested command" hint |
| Unknown flag              | Exit 2. Stderr: ` ›   Error: Nonexistent flag: --x` plus usage  | Exit 2. Stderr: `Error: Unknown flag: --x` and `Code: UNKNOWN_FLAG`                               |
| Missing required argument | Exit 2. Stderr: ` ›   Error: Missing 1 required arg` plus usage | Exit 2. Stderr: `Error: missing required argument <name>` plus usage                              |
| Mutually exclusive flags  | Exit 2                                                          | Exit 2. Message: `--a cannot also be provided when using --b`                                     |
| Runtime or API failure    | Exit 1. Stderr: ` ›   Error: message`                           | Exit 1. Stderr: `Error (CODE): message`, for example `Error (AUTHENTICATION_REQUIRED): ...`       |
| Help                      | Exit 0, stdout                                                  | Exit 0, stdout                                                                                    |

Do not parse the ` ›   Error:` prefix. It no longer appears.

Help text layout changed completely. Do not parse help output.

## New commands

Component catalog:

| Command                                                      | Arguments | Options                                                                                                                                           |
| ------------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components:get <componentKey>`                              |           | `--public`, `--private`, `--version <int>`                                                                                                        |
| `components:search <terms>`                                  |           | table flags, `--kind`/`-k <all\|components\|actions\|triggers\|data-sources>` (default `all`), `--category`, `--context`, `--public`, `--private` |
| `components:versions <componentKey>`                         |           | table flags, `--after`, `--all`, `--first`, `--public`, `--private`                                                                               |
| `components:actions:get <componentKey> <actionKey>`          |           | `--public`, `--private`, `--version <int>`                                                                                                        |
| `components:triggers:get <componentKey> <triggerKey>`        |           | `--public`, `--private`, `--version <int>`                                                                                                        |
| `components:data-sources:get <componentKey> <dataSourceKey>` |           | `--public`, `--private`, `--version <int>`                                                                                                        |
| `components:connections:list <componentKey>`                 |           | table flags, `--public`, `--private`, `--version <int>`                                                                                           |
| `components:connections:get <componentKey> <connectionKey>`  |           | `--public`, `--private`, `--version <int>`                                                                                                        |

Executions and logs:

| Command                          | Arguments | Options                                                                                                                                                                                                                                                                                                              |
| -------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `executions:list`                |           | table flags, `--after`, `--all`, `--first`, `--since`, `--until`, `--instance`, `--customer`, `--integration`, `--flow`, `--includeTests`, `--status`/`-S`, `--result`, `--invokeType`, `--error`, `--payload` (repeatable), `--where`/`-w` (repeatable), `--orderBy` (default `startedAt`), `--desc` (default true) |
| `executions:count`               |           | `--since`, `--until`, `--instance`, `--customer`, `--integration`, `--flow`, `--includeTests`, `--status`, `--where`/`-w`                                                                                                                                                                                            |
| `executions:fields`              |           | table flags, `--since`, `--until`, `--search`/`-s`, `--instance`, `--customer`, `--integration`                                                                                                                                                                                                                      |
| `executions:get <executionId>`   |           |                                                                                                                                                                                                                                                                                                                      |
| `executions:steps <executionId>` |           | table flags, `--after`, `--all`, `--first`, `--direction <asc\|desc>` (default `asc`), `--failed`, `--where`/`-w`                                                                                                                                                                                                    |
| `executions:logs <executionId>`  |           | table flags, `--after`, `--all`, `--first`, `--direction` (default `asc`), `--severity`, `--message`/`-m`, `--step`, `--where`/`-w`                                                                                                                                                                                  |
| `logs:list`                      |           | table flags, `--after`, `--all`, `--first`, `--since`, `--until`, `--instance`, `--customer`, `--integration`, `--flow`, `--includeTests`, `--direction` (default `desc`), `--execution`, `--severity`, `--message`/`-m`, `--type`, `--where`/`-w`                                                                   |

Code Native Integration manifests:

| Command                                         | Arguments | Options                                                                       |
| ----------------------------------------------- | --------- | ----------------------------------------------------------------------------- |
| `integrations:manifests:add <componentKeys...>` | required  | `--public`, `--private`, `--register` (default true, `--no-register` to skip) |
| `integrations:manifests:list`                   |           | table flags                                                                   |

The `--status` enum for `executions:list` and `executions:count` is `pending`, `success`, `error`, `queued`, `canceling`, `canceled`.

"Table flags" means the Prism 10 table flag set: `--columns`, `--csv`, `--extended`/`-x`, `--filter`, `--no-header`, `--no-truncate`, `--output <csv|json|yaml>`, `--sort`.

### Organization and embedded theming (additive)

Prism 10.5.0 has no `organization:theme:*` commands. Prism 11 adds these eight commands:

| Command                                  | Arguments                         | Options              |
| ---------------------------------------- | --------------------------------- | -------------------- |
| `organization:theme:get`                 |                                   | Optional `--variant` |
| `organization:theme:color:set`           | `<type> <value>`                  | Required `--variant` |
| `organization:theme:color:reset`         | `<type>`                          | Required `--variant` |
| `organization:theme:border-radius:set`   | `<value>` (integer pixels, 0–100) | Required `--variant` |
| `organization:theme:border-radius:reset` |                                   | Required `--variant` |
| `organization:theme:elevation:enable`    |                                   | Required `--variant` |
| `organization:theme:elevation:disable`   |                                   | Required `--variant` |
| `organization:theme:elevation:reset`     |                                   | Required `--variant` |

The variants are `light`, `dark`, `embedded-light`, and `embedded-dark`. The first two style your team's Prismatic app; the embedded variants style the embedded screens your customers see. No mutation silently chooses a variant. These commands manage organization theme configuration, not per-customer overrides.

Color values accept three- or six-digit hex (quote `#` values in shells) and `rgb(...)`. Color types are discoverable through `--schema`: `primary`, `secondary`, `accent`, `warning`, `error`, `info`, `success`, `other01`, `icon_color`, `link_color`, `sidebar`, `background`, `debug`, `trace`, `metric`, `designer_shell`, and `neutral`. Hyphenated spellings such as `icon-color` are also accepted. Read results use underscore names, which can be passed back to set/reset commands.

```bash
prism organization theme get --variant embedded-light --agent --json --read-only
prism organization theme color set primary '#4f46e5' --variant embedded-light --agent --yes
prism organization theme border-radius set 8 --variant embedded-dark --agent --yes
prism organization theme elevation disable --variant embedded-dark --agent --yes
prism organization theme color reset primary --variant embedded-light --agent --yes
```

`get` returns `variants`, each containing `colors` and `properties` maps of custom values. It does not calculate effective default colors. An uncustomized requested variant returns empty maps; an unfiltered result may include `all` for unscoped properties. Mutations return `variant`, `changed`, `colors`, and `properties`. Reset removes the selected custom entry; defaults or applicable unscoped settings can then apply. Theme changes apply immediately. Commands preserve unrelated entries in both collections; they refuse a partial theme read rather than writing truncated data. They perform a read followed by a whole-theme update, so callers should serialize concurrent theme changes.

## Changed commands

Flag additions are listed separately from behavior and output changes. Retained input contracts do not imply identical output columns or timing.

### Pagination flags on list commands

These commands got `--after <cursor>`, `--all`, and `--first <int>`:

`alerts:groups:list`, `alerts:monitors:list`, `alerts:webhooks:list`, `components:list`, `components:actions:list`, `components:data-sources:list`, `components:triggers:list`, `customers:list`, `customers:users:list`, `instances:list`, `instances:config-vars:list`, `instances:flow-configs:list`, `integrations:list`, `integrations:flows:list`, `on-prem-resources:list`, `organization:users:list`.

In human mode these commands still fetch every page by default. In agent mode they return one page unless `--all` is given.

### Other flag additions

| Command                                                                               | Added                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components:list`                                                                     | `--category <string>`, `--dataSourceType <string>`, `--fulltext <string>`, `--hasActions`, `--hasConnections`, `--hasDataSources`, `--hasTriggers`, `--public`, `--private` (`--public` and `--private` are mutually exclusive)                                                                   |
| `components:actions:list`                                                             | `--search`/`-s <string>`, `--version <int>`                                                                                                                                                                                                                                                       |
| `components:triggers:list`                                                            | `--search`/`-s <string>`, `--version <int>`                                                                                                                                                                                                                                                       |
| `components:data-sources:list`                                                        | `--search`/`-s <string>`, `--type <string>`, `--version <int>`                                                                                                                                                                                                                                    |
| `components:actions:list`, `components:triggers:list`, `components:data-sources:list` | `--public` and `--private` are now declared mutually exclusive                                                                                                                                                                                                                                    |
| `components:publish`                                                                  | `--wait` (default true, `--no-wait` to return after submit), `--wait-timeout <seconds>` (default 300). The command now blocks until the version is available                                                                                                                                      |
| `integrations:import`                                                                 | `--wait` (default true), `--wait-timeout <seconds>` (default 300). Waits for the imported integration's test instance to be deployed at the imported version. `--no-wait` skips this final readiness check; Code Native component publication is always awaited before the definition is imported |
| `integrations:publish`                                                                | `--wait` (default true), `--wait-timeout <seconds>` (default 300)                                                                                                                                                                                                                                 |
| `components:dev:test`                                                                 | `--action <key>`, `--action-inputs <json>`, `--connection <key>`, `--connection-inputs <json>`. Used in agent mode instead of interactive prompts                                                                                                                                                 |
| `components:dev:run`                                                                  | Declared positional `command...` for the words after `--`. Usage did not change                                                                                                                                                                                                                   |
| `login`, `login:switch`                                                               | `--tenant-id <id>` to select a tenant without a prompt                                                                                                                                                                                                                                            |
| `organization:signing-keys:generate`                                                  | `--private-key-file` / `-o <path>`. Writes to a new file with mode `0600`; refuses an existing path before generating the key. Required in agent mode and MCP (`PRIVATE_KEY_FILE_REQUIRED`, exit 2, if omitted after mutation approval)                                                           |
| `customers:users:update`                                                              | `--dark-mode` and `--dark-mode-os-sync` now declare the enum `true                                                                                                                                                                                                                                | false`. Other values were already rejected at runtime |

### Human command results (breaking)

`--no-agent` and `FORCE_HUMAN_MODE=true` control behavior, not the result format of every command. Many Prism 11 commands return named incur results in human mode as well. For example, `me` returns named identity fields, and resource mutations return fields such as `customerId` or `integrationId`, with optional follow-up suggestions. Human status/progress messages are written to stderr. Consumers must not assume a bare ID on stdout or parse the old `me` label lines from stdout.

Use `--format json` and the command's `--schema` to consume named results. Legacy table commands retain `--output json|csv|yaml` in human mode; `me:token` and `graphql:query` also explicitly preserve their human output policy. For uniform structured results across those commands, select `--agent --json`. Successful list JSON then exposes `items` directly, not an array at the top level.

Execution, listening, login, and development subprocess commands can return typed streaming events. Use the default agent format or `--format jsonl` for incremental consumption; explicit JSON, YAML, and TOON buffer until completion. Authenticate before buffered login or MCP: those routes return `AUTHENTICATION_REQUIRED` when login is needed. Agent CLI login can stream the browser challenge with the default format or `--agent --yes --format jsonl`, then wait up to three minutes for authentication.

### Component member-list output (breaking)

Live checks found column drift in `components:actions:list`, `components:triggers:list`, and `components:data-sources:list`. The action-list comparison also confirmed the drift in agent results:

| Output                  | Prism 10.5.0                                                       | Prism 11                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Action default columns  | `label`, `description`                                             | `key`, `label`, `description`                                                                                                           |
| Action extended columns | `id`, `key`, `label`, `description`, `componentid`, `componentkey` | `id`, `key`, `label`, `description`, `important`, `allowsBranching`, `terminateExecution`, `componentKey`, `componentVersion`, `public` |

Additional nonempty public-component probes confirmed:

| Output                       | Prism 10.5.0                                                                                             | Prism 11                                                                                                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trigger default columns      | `label`, `description`                                                                                   | `key`, `label`, `description`                                                                                                                                                             |
| Trigger extended columns     | `id`, `key`, `label`, `description`, `componentid`, `componentkey`                                       | `id`, `key`, `label`, `description`, `isCommonTrigger`, `isPollingTrigger`, `scheduleSupport`, `synchronousResponseSupport`, `batchSupport`, `componentKey`, `componentVersion`, `public` |
| Data-source default columns  | `label`, `description`, `dataSourceType`                                                                 | `key`, `label`, `description`, `dataSourceType`                                                                                                                                           |
| Data-source extended columns | `id`, `key`, `label`, `description`, `dataSourceType`, `detailDataSource`, `componentid`, `componentkey` | `id`, `key`, `label`, `description`, `dataSourceType`, `isDetailDataSource`, `detailDataSource`, `componentKey`, `componentVersion`, `public`                                             |

`componentid` is no longer a member-list column, and `componentkey` becomes `componentKey`. Update `--columns`, sorting/filtering expressions, and JSON/CSV readers that use those names. Human JSON table cells remain strings (including version numbers and boolean values); agent items retain typed values. For a common human-output subset, use `--columns label,description --output json` and explicitly disable agent mode.

The suite's first selected component had no triggers or data sources. Separate probes used `webhook-triggers` for nonempty trigger rows and `slack` for nonempty data-source rows; the differences above were observed in actual human JSON output, rather than inferred from those empty passing checks.

### Read-only and transport behavior

`--read-only` / `PRISM_READ_ONLY=1` also block local writes: scaffolding, profile changes, downloaded step-result files, and manifest registration are marked mutations. Read-only GraphQL queries remain available, while a document containing a mutation requires approval and is blocked in read-only mode. YAML validation remains a validation operation despite using a GraphQL mutation route; it does not import an integration.

MCP tools accept execution controls under `context` (for example, `context.yes`, `context.readOnly`, and `context.profile`). A server launched read-only stays read-only even if a tool call supplies `context.readOnly=false`. Transport stdin is reserved: commands that normally read stdin must use a file or explicit argument instead (`STDIN_UNAVAILABLE`, exit 2).

### Text-only changes

- Descriptions of the `--no-header` and `--no-truncate` table flags changed. Behavior is the same.
- Several topic descriptions changed, for example `components` and `executions`.
- Help output for positional arguments uses the camelCase declared name, for example `<alertMonitorId>` instead of `ALERTMONITORID`.

## Removed

- Flags: `components:publish --confirm`, `integrations:import --confirm`, `me:token:revoke --confirm`, `integrations:flows:listen --no-prompt`. See "Confirmation prompts".
- The oclif ` ›   Warning: prism update available` text is gone. incur prints its own "Update available" notice in human mode only, and adds the `--update` and `--update-check` global flags.
- The `@prismatic-io/prism/<version> <platform> node-<version>` version banner is gone.

## Checklist for wrappers

1. Require Node.js 22.18.0 or newer.
2. Set `PRISM_NO_AGENT=1` or pass `--no-agent` to retain human pagination/prompt behavior. For named results, explicitly select `--format json` and parse the documented fields; for legacy human tables, keep `--output json`. For uniform agent results, use `--agent --json`.
3. Replace `--no-confirm` and `--no-prompt` with the global `--yes`. Pass `--yes` for confirmation prompts without a terminal and for every marked mutation in agent mode.
4. Stop parsing `--version` output as a banner. It is now the bare semantic version.
5. Stop matching the ` ›   Error:` prefix. Match exit codes instead: 2 for usage and confirmation errors, 1 for runtime errors.
6. Allow for publication/readiness polling (300 seconds by default for each wait stage). `--no-wait` skips publication polling for standalone publishes and final test-instance readiness for imports. CNI imports still await component publication before importing the definition; `--wait-timeout` also applies to that mandatory stage. A timeout can happen after a remote write, so inspect state before retrying.
7. Update component member-list column selectors and JSON/CSV readers as described above. Use explicit columns for a stable subset.
8. In agent mode or MCP, supply `--private-key-file <new-path>` when generating a signing key. Read the private key from that file, not stdout.

## Verification

Verified October 1, 2026 against `https://app.rwersal.prismatic-dev.io` using published Prism 10.5.0 and a freshly bundled Prism 11 from `next` at `3dd86795`, on Node.js `24.21.0`. Both `me` commands confirmed the same user, organization, tenant, and endpoint. No credentials or full resource responses are included here.

| Check                              | Result                                                                                                                                                                                                                                                                                                            |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Published input surface            | 10.4.0 and 10.5.0 manifests have identical command arguments and flags. Prism 10.5.0 has 91 manifest commands; Prism 11 has 118 registry entries, including the two autocomplete compatibility commands                                                                                                           |
| Live read-only compatibility suite | **26 passed, 1 failed** out of 27. The failure is the action-list column change documented above; both human and agent comparisons detect it                                                                                                                                                                      |
| Parent-resource checks             | Customers, integrations, instances, components, on-prem resources, alerts, customer roles, log severities, organization connections/signing-key lists/users/roles; selected customer/integration columns and cursor pagination where sufficient rows existed                                                      |
| Child-resource checks              | Customer users, instance config vars/flow configs, integration flows/versions, component actions/data sources/triggers, and alert events. Empty results limit the evidence to that resource state                                                                                                                 |
| Additive API commands              | Component search/get/connections, execution count/list, and log list succeeded. Prism 10 rejected the sampled new theme/execution routes with exit 2                                                                                                                                                              |
| Member-list probes                 | Nonempty action (`http` and a private component), trigger (`webhook-triggers`), and data-source (`slack`) lists confirmed the documented default and extended column changes                                                                                                                                      |
| Embedded theme                     | Read all four variants; set embedded-light border radius to 13, reread the persisted value, then restored the previous value or reset it. The full theme matched the pre-test state after restoration                                                                                                             |
| Invocation probes                  | Default `me` confirmed named Prism 11 stdout results and identity status on stderr. Both versions accepted colon and space commands. Prism 10 rejected `-h`; Prism 11 accepted it. Both rejected unknown flags with exit 2; Prism 11 returned structured paginated customer items with `--agent --json --first 1` |
| Targeted automated checks          | 398 contract, theme, integration-import, availability, and signing-key file tests passed; 7 bundled CLI tests passed                                                                                                                                                                                              |

To reproduce the live compatibility suite with a built checkout and an isolated Prism 10.5.0 binary:

```bash
PRISMATIC_URL=https://app.rwersal.prismatic-dev.io \
PRISM_LEGACY_BIN=/path/to/prism-10.5.0/node_modules/.bin/prism \
bun run test:live test/live/readonly.test.ts
```

The documented publication waits, signing-key file generation, MCP lifecycle, and commands outside these probes were checked in source/contracts or targeted tests, not exercised as live remote mutations during this refresh. The embedded theme check verifies stored configuration, not browser rendering. The read-only suite is not entirely green; its observed output drift must be accounted for by consumers.
