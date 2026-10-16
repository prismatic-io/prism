<div align="center">
  <img src="https://prismatic.io/favicon-48x48.png" alt="Prismatic" />
  <h1>@prismatic-io/prism</h1>
</div>

**Prism** is [Prismatic's](https://prismatic.io/) CLI tool that allows you to build, deploy, and support integrations in Prismatic from the comfort of your command line.

## Using Prism

Prism requires Node.js 22.19.0 or newer and npm.
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
Organization ID: example-organization-id
Endpoint URL: https://app.prismatic.io
Authentication: Profile
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

### npm component dependencies

Component source keeps its conventional `export default component(...)` in
`src/index.ts`, and tests continue to use that export. `build-npm.mjs` generates a
temporary callable adapter for the npm build and removes it afterward; no authored
wrapper, separate definition file, or connection tuple assertion is required.
Spectral 10.36.0 or later retains the authoring data used by this adapter and must
remain a peer dependency of the npm package.

When importing a code-native integration, Prism resolves marked component packages
in its direct `dependencies` by the SHA-1 signature of their platform artifact.
It reuses any matching published version, including older versions, and publishes
missing private artifacts. Public artifacts must already have a matching published
version. Prism waits for processing artifacts before importing the integration.

The imported YAML uses `signature` selectors for these components and the generated
integration component, rather than `LATEST` or numeric versions. Unrelated component
references are preserved. Conflicting installed artifacts or existing signature
selectors that disagree with the installed package cause the import to fail.

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
