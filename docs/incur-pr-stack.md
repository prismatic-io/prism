# Incur review stack

The first PR targets the long-lived `agent` branch. Each subsequent PR targets the
preceding branch. Review and merge from the bottom of the stack upward. If a PR is
squash-merged, rebase its descendants before merging the next PR.

The original `incur-port`, `incur-codegen-v6`, `incur-agent-contracts`, and
`incur-native-commands` bookmarks are preserved. `incur-validated-snapshot` identifies
the validated implementation (`7caa46cd`) used to build this stack.

## Review boundaries

Changed lines count additions plus deletions. Artifact lines include generated TypeScript,
lockfiles, and captured JSON fixtures. GitHub's generated-file attributes collapse these
artifacts. Intermediate oclif manifest regeneration is deliberately excluded from commits.

| PR | Branch | Scope | Handwritten lines | Artifact lines | Passing tests |
| --- | --- | --- | ---: | ---: | ---: |
| [#310](https://github.com/prismatic-io/prism/pull/310) | `incur-01-runtime` | Prepare Node 22+ CI and dependencies for incur | 63 | 506 | 298 |
| [#311](https://github.com/prismatic-io/prism/pull/311) | `incur-02-graphql-artifacts` | Generate typed GraphQL operation artifacts | 1,459 | 12,177 | 299 |
| [#312](https://github.com/prismatic-io/prism/pull/312) | `incur-03-graphql-transport` | Add typed GraphQL transport and shared API helpers | 622 | 0 | 299 |
| [#313](https://github.com/prismatic-io/prism/pull/313) | `incur-04-graphql-client` | Use typed GraphQL documents and validate resource lookups | 2,195 | 0 | 313 |
| [#314](https://github.com/prismatic-io/prism/pull/314) | `incur-05-command-runtime` | Introduce native incur schemas and request middleware | 1,202 | 0 | 332 |
| [#315](https://github.com/prismatic-io/prism/pull/315) | `incur-06-auth-isolation` | Isolate authentication and profile state per invocation | 458 | 0 | 336 |
| [#316](https://github.com/prismatic-io/prism/pull/316) | `incur-07-output-schemas` | Add native table schemas and structured output helpers | 518 | 0 | 338 |
| [#317](https://github.com/prismatic-io/prism/pull/317) | `incur-08-subprocess-streams` | Stream subprocess output with bounded buffering and cancellation | 398 | 0 | 346 |
| [#318](https://github.com/prismatic-io/prism/pull/318) | `incur-09-cli-profiles` | Mount native incur commands and migrate profiles | 995 | 7,482 | 349 |
| [#319](https://github.com/prismatic-io/prism/pull/319) | `incur-10-auth-commands` | Migrate login and identity commands to native incur schemas | 561 | 0 | 359 |
| [#320](https://github.com/prismatic-io/prism/pull/320) | `incur-11-customers` | Migrate customer and customer-user commands to native incur | 712 | 0 | 371 |
| [#321](https://github.com/prismatic-io/prism/pull/321) | `incur-12-organization` | Migrate organization, on-premise, and log commands | 895 | 0 | 388 |
| [#322](https://github.com/prismatic-io/prism/pull/322) | `incur-13-alerts` | Migrate alert commands to native incur schemas | 718 | 0 | 400 |
| [#323](https://github.com/prismatic-io/prism/pull/323) | `incur-14-instances` | Migrate instance management and configuration commands | 664 | 0 | 409 |
| [#324](https://github.com/prismatic-io/prism/pull/324) | `incur-15-integrations` | Migrate integration lifecycle and discovery commands | 940 | 0 | 422 |
| [#325](https://github.com/prismatic-io/prism/pull/325) | `incur-16-component-runtime` | Migrate component commands with isolated project loading | 1,560 | 0 | 435 |
| [#326](https://github.com/prismatic-io/prism/pull/326) | `incur-17-file-commands` | Migrate integration files, workflow, and execution result commands | 856 | 0 | 448 |
| [#327](https://github.com/prismatic-io/prism/pull/327) | `incur-18-scaffolding` | Migrate scaffolding commands and isolate generator directories | 847 | 0 | 452 |
| [#328](https://github.com/prismatic-io/prism/pull/328) | `incur-19-flow-tests` | Stream flow-test execution results through native incur generators | 1,107 | 0 | 460 |
| [#329](https://github.com/prismatic-io/prism/pull/329) | `incur-20-listener` | Stream listener events with request-scoped cleanup | 680 | 0 | 465 |
| [#330](https://github.com/prismatic-io/prism/pull/330) | `incur-21-dev-run` | Migrate component dev-run to native subprocess streams | 172 | 0 | 467 |
| [#331](https://github.com/prismatic-io/prism/pull/331) | `incur-22-query-completion` | Migrate GraphQL and completion commands and verify structured results | 783 | 0 | 490 |
| [#332](https://github.com/prismatic-io/prism/pull/332) | `incur-23-native-cutover` | Complete native incur cutover and verify the public CLI and MCP contracts | 1,874 | 8,030 | 775 |
| [#333](https://github.com/prismatic-io/prism/pull/333) | `incur-24-review-evidence` | Review guide, CLI documentation, and live compatibility evidence | Documentation | Captured evidence | 775 |

The largest handwritten changes are the resource-handler conversion (mostly removal of
inline GraphQL queries), shared command runtime with tests, component/project isolation,
and final native cutover with complete CLI/MCP contract coverage. The GraphQL artifact PR
contains the extracted operation documents beside their generated typed nodes.

## Intermediate behavior

The early prerequisites retain the oclif CLI. From the profile migration onward, a small
`migration-bridge.ts` registers migrated commands in that catalog and delegates execution
to incur. Unmigrated commands continue using oclif. Contract tests grow with the native
command catalog and verify published inputs and native schema discovery at each step.

The native cutover removes the bridge, legacy table helpers, base command, and oclif
dependencies. It installs the final parser compatibility, CLI entrypoint, public-contract
tests, and real MCP transport tests. No transitional adapter remains at the tip.

## Validation

Every implementation boundary passed format/lint, TypeScript, bundle, and the test suite
on Node 24. The table records the passing test counts; three tests were skipped at each
boundary. The new CI task runs validation sequentially because build and test both clean
scaffold fixtures. The intermediate dependency set also passed npm's Node 22 engine-strict
dry run. GitHub CI checks Linux on Node 22/24/26 and runs a separate Windows test job.

After rebuilding the history, production application source, package.json, bun.lock, and build.ts
were compared directly with `incur-validated-snapshot` and matched exactly. The final
sequential `mise run validate` passed with **775 tests, 3 skipped**, plus installed CLI
smoke. History cleanup changed only generated manifest noise, generated-file attributes,
and CI task ordering at the already-tested boundaries. GitHub CI additionally exposed
a generated-manifest formatter check and Windows short/long-path comparison. The earliest
relevant PRs now exclude that generated manifest from formatting and canonicalize both
paths in the process-isolation assertion. Windows cold-start integration tests receive
a 30-second timeout, and POSIX quoting assertions use Git for Windows' `sh.exe` there.
GraphQL source scans exclude temporary scaffold output to avoid racing generator cleanup.
No assertions are skipped or removed. Production behavior is unchanged.

The preserved [native adoption report](incur-native-adoption.md) links the latest upstream
incur findings and the live evidence: **56 read-only comparisons matched** published Prism
10.2.0, and **two customer lifecycle checks passed** against the development stack, with
cleanup independently verified. Those live checks remain applicable to the unchanged
production application source at this stack's tip.

Draft PRs [#310](https://github.com/prismatic-io/prism/pull/310) through
[#333](https://github.com/prismatic-io/prism/pull/333) are published. Each PR links its
GitHub CI runs; the complete stack starts at `agent` and ends at `incur-24-review-evidence`.
