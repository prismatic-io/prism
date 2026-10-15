import { LegacyToolchain } from "./legacy.js";
import { InternalModernToolchain, ModernToolchain } from "./modern.js";
import type { Toolchain, ToolchainName } from "./types.js";

export { LegacyToolchain } from "./legacy.js";
export { InternalModernToolchain, ModernToolchain } from "./modern.js";
export type { Toolchain, ToolchainName } from "./types.js";

export const TOOLCHAIN_NAMES = ["modern", "legacy"] as const satisfies readonly ToolchainName[];

export const DEFAULT_TOOLCHAIN: ToolchainName = "modern";

const toolchains: Record<ToolchainName, Toolchain> = {
  modern: new ModernToolchain(),
  legacy: new LegacyToolchain(),
};

const internalToolchains: Partial<Record<ToolchainName, Toolchain>> = {
  modern: new InternalModernToolchain(),
};

/**
 * `internal` selects the variant Prismatic's own components are scaffolded with, where
 * one exists for the toolchain (only modern); otherwise the ordinary toolchain.
 */
export const getToolchain = (name: ToolchainName, { internal = false } = {}): Toolchain =>
  (internal ? internalToolchains[name] : undefined) ?? toolchains[name];

/**
 * Every build/test/lint config filename either toolchain may emit. Used by
 * `prism components:publish --include-source` to package config alongside source
 * without knowing which toolchain produced the component.
 */
export const TOOLCHAIN_CONFIG_OUTPUTS: readonly string[] = [
  "tsconfig.json",
  "webpack.config.js",
  "jest.config.js",
  "tsdown.config.mts",
  "vitest.config.ts",
  "biome.json",
  "biome.jsonc",
  "tsdown.npm.config.mts",
];
