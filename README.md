<div align="center">
  <img src="https://prismatic.io/favicon-48x48.png" />
  <h1>@prismatic-io/prism</h1>
</div>

**Prism** is [Prismatic's](https://prismatic.io/) CLI tool that allows you to build, deploy, and support integrations in Prismatic from the comfort of your command line.

## Using Prism

Prism requires Node.js 22 or newer and npm.
You can download both from the [NodeJS Website](https://nodejs.org/).
Prism works on MacOS, Linux, Windows and [WSL](https://docs.microsoft.com/en-us/windows/wsl/).

Once `node` and `npm` are installed, run this to install Prismatic's CLI tool:

```bash
$ npm install --global @prismatic-io/prism
```

This will install the `prism` command globally.
To log in, run:

```bash
$ prism login
```

You can then see your login information with:

```bash
$ prism me
Name: John Doe
Email: john.doe@example.com
Organization: Example Software Company
Endpoint URL: https://app.prismatic.io
Profile: default
```

### Profiles

Profiles let Prism stay logged in to multiple stacks or tenants at once. Each
profile keeps its credentials, stack, and tenant together. Commands use the
default profile unless another is selected.

Existing Prism configuration is used automatically and migrated to the profile
format the next time Prism updates it.

```bash
# Log in to a profile on another stack.
$ PRISMATIC_URL=https://my-stack.prismatic.io prism login --profile staging

# Select a profile for one command or the current shell.
$ prism integrations:list --profile staging
$ export PRISM_PROFILE=staging

# View, change, or delete saved profiles.
$ prism profiles:list
$ prism profiles:use staging
$ prism profiles:delete staging
```

Prism selects a profile from `--profile`, then `PRISM_PROFILE`, then the saved
default. Environment credentials take precedence over credentials stored in the
selected profile. When environment credentials are set, they use `PRISMATIC_URL`
and `PRISMATIC_TENANT_ID` instead of values from a profile. Login, logout, and
tenant switching still operate on the selected profile.

For help with Prism, please see our [Prism documentation page](https://prismatic.io/docs/cli/).
There, you will find information about the various subcommands you can run, troubleshooting tips, etc.

### Automation and agents

Prism automatically emits structured output when it detects a supported coding agent. You can also
select the behavior explicitly with `--agent` or `--no-agent`. Use `--llms`, `--schema`, and
`--format json` to discover commands and consume their results programmatically.

Commands that can modify remote or local state require `--yes` in agent mode. Use `--read-only`, or
set `PRISM_READ_ONLY=true` when starting an MCP server, to reject every state-changing command even
when approval was supplied. MCP tool calls supply approval and profile controls through
`context`, for example `{ "name": "Acme", "context": { "yes": true, "profile": "staging" } }`.
Server launch defaults such as `prism --profile staging --mcp` are inherited by calls.
A server started read-only cannot be made writable by a tool call.

Authenticate a profile before starting an MCP server or using buffered agent output (`--json`,
`--format json`, YAML, or explicit TOON). Run `prism login --url` in a terminal. Agent CLI login
supports the default streaming format or `prism login --agent --yes --format jsonl`; it emits the
browser challenge immediately and waits up to three minutes for authentication. MCP and buffered
login calls return `AUTHENTICATION_REQUIRED` when authentication is needed. Already-authenticated
profiles can still be checked in those modes.

Paginated list commands return one page and a resumable `pageInfo.endCursor` in agent mode. Pass
`--after <cursor>` to resume, `--first <count>` to bound the request, or `--all` to fetch every page.
Human-readable invocations continue to fetch all pages by default.

Agent list results include IDs and all available columns by default, with numbers, booleans,
arrays, and objects preserved. Use `--columns` or incur's `--filter-output` to select fields.
Resource commands return named fields such as `customerId`, `integrationId`, `executionId`,
`path`, or `definition`. Follow-up suggestions retain the explicitly selected profile.

Prism 11 uses incur's named command results by default, including human invocations.
Use `--format json` in scripts and read fields such as `token` or `customerId` rather than
assuming stdout contains a bare scalar. `FORCE_HUMAN_MODE=true` and `--no-agent` select human
behavior; they do not restore Prism 10 result formatting. The public `--output json|csv|yaml`
table formats remain available. Incur's `--format json|jsonl|yaml|toon|md` selects structured
command results.
Execution, listening, authentication, and development subprocess commands emit typed events.
Use the default agent format or `--format jsonl` for incremental logs and payloads;
explicit JSON, YAML, and TOON output is buffered until the command completes.

Use `prism skills add --agent --yes` to install generated command skills, `prism mcp add --agent --yes`
to register the MCP server, or `prism --mcp` to run it directly. `prism completions bash` and
`prism completions zsh` print shell hooks; existing `autocomplete` entry points remain available.


## What is Prismatic?

Prismatic is the leading embedded iPaaS, enabling B2B SaaS teams to ship product integrations faster and with less dev time. The only embedded iPaaS that empowers both developers and non-developers with tools for the complete integration lifecycle, Prismatic includes low-code and code-native building options, deployment and management tooling, and self-serve customer tools.

Prismatic's unparalleled versatility lets teams deliver any integration from simple to complex in one powerful platform. SaaS companies worldwide, from startups to Fortune 500s, trust Prismatic to help connect their products to the other products their customers use.

With Prismatic, you can:

- Build [integrations](https://prismatic.io/docs/integrations/) using our [intuitive low-code designer](https://prismatic.io/docs/integrations/low-code-integration-designer/) or [code-native](https://prismatic.io/docs/integrations/code-native/) approach in your preferred IDE
- Leverage pre-built [connectors](https://prismatic.io/docs/components/) for common integration tasks, or develop custom connectors using our TypeScript SDK
- Embed a native [integration marketplace](https://prismatic.io/docs/embed/) in your product for customer self-service
- Configure and deploy customer-specific integration instances with powerful configuration tools
- Support customers efficiently with comprehensive [logging, monitoring, and alerting](https://prismatic.io/docs/monitor-instances/)
- Run integrations in a secure, scalable infrastructure designed for B2B SaaS
- Customize the platform to fit your product, industry, and development workflows

## Who uses Prismatic?

Prismatic is built for B2B software companies that need to provide integrations to their customers. Whether you're a growing SaaS startup or an established enterprise, Prismatic's platform scales with your integration needs.

Our platform is particularly powerful for teams serving specialized vertical markets. We provide the flexibility and tools to build exactly the integrations your customers need, regardless of the systems you're connecting to or how unique your integration requirements may be.

## What kind of integrations can you build using Prismatic?

Prismatic supports integrations of any complexity - from simple data syncs to sophisticated, industry-specific solutions. Teams use it to build integrations between any type of system, whether modern SaaS or legacy with standard or custom protocols. Here are some example use cases:

- Connect your product with customers' ERPs, CRMs, and other business systems
- Process data from multiple sources with customer-specific transformation requirements
- Automate workflows with customizable triggers, actions, and schedules
- Handle complex authentication flows and data mapping scenarios

For information on the Prismatic platform, check out our [website](https://prismatic.io/) and [docs](https://prismatic.io/docs/).

## License

This repository is MIT licensed.
