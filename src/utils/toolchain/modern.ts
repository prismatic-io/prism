import { Toolchain, type ToolchainName } from "./types.js";

/**
 * The default, lean stack: tsdown bundles a self-contained CommonJS dist/index.js,
 * vitest runs the (jest-style) tests, and Biome handles linting.
 * Templates live under `templates/modern/`.
 */
export class ModernToolchain extends Toolchain {
  readonly name: ToolchainName = "modern";

  readonly scripts = {
    build: "tsdown",
    test: "vitest run",
    lint: "biome lint .",
    typecheck: "tsc --noEmit",
    format: "biome format --write .",
  };

  readonly packageJson = {};

  readonly devDependencies = {
    "@biomejs/biome": "2.5.1",
    dotenv: "^17.2.2",
    tsdown: "0.22.3",
    typescript: "6.0.3",
    vitest: "4.1.9",
  };
}
