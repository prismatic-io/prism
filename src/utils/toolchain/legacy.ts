import { Toolchain, type ToolchainName } from "./types.js";

/**
 * The original webpack + jest + eslint scaffold.
 * Templates live under `templates/legacy/`.
 */
export class LegacyToolchain extends Toolchain {
  readonly name: ToolchainName = "legacy";

  readonly scripts = {
    build: "webpack",
    test: "jest",
    lint: "eslint --ext .ts .",
    typecheck: "tsc --noEmit",
    format: "prettier --write .",
  };

  readonly packageJson = {
    eslintConfig: {
      root: true,
      extends: ["@prismatic-io/eslint-config-spectral"],
    },
  };

  readonly devDependencies = {
    "@prismatic-io/eslint-config-spectral": "2.1.0",
    "@types/jest": "29.5.14",
    "copy-webpack-plugin": "14.0.0",
    dotenv: "^17.2.2",
    eslint: "^8.57.1",
    jest: "29.7.0",
    prettier: "3.8.3",
    "ts-jest": "29.3.2",
    "ts-loader": "9.5.2",
    // Legacy stack isn't validated against TypeScript 6+.
    typescript: "^5.8.3",
    webpack: "5.105.3",
    "webpack-cli": "6.0.1",
  };
}
