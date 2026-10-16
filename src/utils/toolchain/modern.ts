import { Toolchain, type ToolchainName } from "./types.js";

/**
 * The default, lean stack: tsdown bundles a self-contained CommonJS dist/index.js,
 * vitest runs the (jest-style) tests, and Biome handles linting.
 * Templates live under `templates/modern/`.
 */
export class ModernToolchain extends Toolchain {
  readonly name: ToolchainName = "modern";
  readonly npmPackage = true;

  readonly scripts = {
    build: "npm run typecheck && tsdown",
    test: "vitest run",
    lint: "biome lint .",
    typecheck: "tsc --noEmit",
    format: "biome format --write .",
  };

  readonly packageJson: Record<string, unknown> = {
    engines: { node: ">=22.18.0" },
  };

  readonly devDependencies: Record<string, string> = {
    "@biomejs/biome": "2.5.1",
    "@types/node": "^22.0.0",
    dotenv: "^17.2.2",
    tsdown: "0.22.3",
    typescript: "6.0.3",
    vitest: "4.1.9",
  };
}

/**
 * The modern toolchain as Prismatic's own components are configured
 * (`prism components:init --prismatic-internal`): their scripts, devDependencies and config files
 * (biome.jsonc, a stricter tsdown build, no `engines`).
 * Templates live under `templates/internal/`.
 */
export class InternalModernToolchain extends ModernToolchain {
  override get templates(): string {
    return "internal";
  }

  override readonly scripts = {
    build: "npm run format && npm run lint && tsdown",
    test: "vitest run",
    lint: "biome check --write .",
    typecheck: "tsc --noEmit",
    format: "biome format --write .",
  };

  override readonly packageJson: Record<string, unknown> = {};

  override readonly devDependencies: Record<string, string> = {
    "@biomejs/biome": "2.5.1",
    "@types/node": "^26",
    dotenv: "^17.2.2",
    tsdown: "0.22.3",
    typescript: "6.0.3",
    vitest: "4.1.9",
  };
}
