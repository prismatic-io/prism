# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Prism is Prismatic's CLI tool for building, deploying, and supporting integrations from the command line. It's a Node.js package built with TypeScript and the oclif CLI framework. The binary is distributed as `@prismatic-io/prism` on npm and provides the `prism` command.

## Build System & Development Commands

**Build Tooling**: Uses Bun for building, testing, and bundling (though it's a Node.js runtime package).

**Common Commands**:
```bash
# Clean build artifacts
bun run clean

# Full build (clean, format, lint, compile, bundle, manifest, copy templates)
bun run build

# Build with source maps for debugging
bun run bundle:debug

# Linting
bun run lint          # Check for issues
bun run lint-fix      # Auto-fix issues

# Formatting (uses Biome)
bun run format        # Format and fix
bun run check-format  # Check only

# Testing
bun run test                # Run all tests
bun test src/path/to/file   # Run specific test file
bun run test:snapshots      # Update test snapshots
```

**Pre-pack**: The `prepack` script runs the full build automatically before npm publish.

## Architecture

### Command Structure

The codebase follows oclif's explicit command strategy:
- All commands are registered in `src/index.ts` in the `Commands` export object
- Commands use colon-separated topics (e.g., `components:init`, `integrations:import`)
- All commands extend `PrismaticBaseCommand` from `src/baseCommand.ts`
- Command files are in `src/commands/` organized by topic (alerts, components, customers, instances, integrations, etc.)

### Core Modules

**Authentication & API Communication**:
- `src/auth.ts` - OAuth2 PKCE flow for login, token management
- `src/graphql.ts` - GraphQL client (`gqlRequest` function) for API communication
- `src/config.ts` - Config file management (`~/.config/prism/config.yml`)
- All API requests go through GraphQL to `https://app.prismatic.io/api` (or `PRISMATIC_URL` env var)

**Key Utilities**:
- `src/utils/integration/` - Integration import/export, YAML processing, code-native integration handling
- `src/utils/component/` - Component publishing and signature generation
- `src/generate/` - Code generation for components from OpenAPI/WSDL specs
- `src/templates/` - EJS templates for generating components, integrations, and formats (copied to lib/ during build)

### Type System

- `src/types.ts` contains GraphQL response types and core domain models
- `src/queries.graphql.ts` contains GraphQL query/mutation strings

### Code Generation

The CLI can generate:
1. **Components** from OpenAPI specs or WSDL definitions (`components:init`)
2. **Integrations** from templates (`integrations:init`)
3. **Format handlers** for data serialization (`components:init:formats`)

Templates are processed with EJS and must be copied to `lib/templates/` during build.

### Two Integration Types

1. **YAML Integrations**: Defined in YAML files, use pre-built components
2. **Code-Native Integrations**: Written in TypeScript, imported as npm packages

Commands handle both types with different code paths (check for YAML vs package.json).

## Testing

- Uses Bun's built-in test runner
- Test files use `.test.ts` suffix
- Tests are excluded from TypeScript compilation (`tsconfig.json`)
- Clean temp directories before tests: `src/commands/components/temp`, `src/commands/components/init/temp`, `src/commands/integrations/convert/temp`
- MSW (Mock Service Worker) is used for API mocking

## Global Flags

All commands inherit these base flags from `PrismaticBaseCommand`:
- `--print-requests` - Debug GraphQL requests
- `--quiet` - Reduce output verbosity

## Entry Points

- `src/run.ts` - Main CLI entry point (referenced by `lib/run.js` in package.json bin)
- `src/index.ts` - Command registry export
- The build process bundles these separately with Bun

## Important Patterns

**Error Handling**: Use `ClientError` class from `graphql.ts` for API errors. It includes response status, headers, and GraphQL errors.

**File System**: Use the wrapped `fs` from `src/fs.ts` which provides the promises API consistently.

**YAML Processing**: Use `loadYaml`/`dumpYaml` from `src/utils/serialize.ts` (wraps js-yaml).

**Component Validation**: The `@prismatic-io/spectral` package is used for component validation (dev dependency).

## Node Version

Requires Node.js >= 18 (see `engines` in package.json).
