import { templateDirectory } from "../../generate/util.js";

export type ToolchainName = "modern" | "legacy";

/**
 * A scaffolding toolchain owns everything that differs between the build/test/lint
 * stacks a generated component or code-native integration can use.
 *
 * Subclasses supply the package.json contributions below as data; the toolchain's
 * template files live under `templates/<name>/` and are rendered by `renderTemplates`.
 */
export abstract class Toolchain {
  abstract readonly name: ToolchainName;
  /** package.json build/test/lint/typecheck/format scripts. */
  abstract readonly scripts: {
    build: string;
    test: string;
    lint: string;
    typecheck: string;
    format: string;
  };
  /** Extra package.json keys this toolchain contributes (e.g. eslintConfig). */
  abstract readonly packageJson: Record<string, unknown>;
  /** devDependencies required to build, test, and lint the scaffold. */
  abstract readonly devDependencies: Record<string, string>;
  /**
   * Whether a component scaffold on this toolchain is also built as an npm package
   * (an npm entrypoint, a platform publishing entrypoint, and an npm build config).
   * Only the modern toolchain; legacy scaffolds are unchanged.
   */
  abstract readonly npmPackage: boolean;

  /** Which templates/<dir>/ holds this toolchain's config files; defaults to its name. */
  get templates(): string {
    return this.name;
  }

  /** Render this toolchain's config files (templates/<templates>/) into the project. */
  renderTemplates(data: Record<string, unknown> = {}): Promise<void> {
    return templateDirectory(this.templates, data);
  }

  /**
   * Render the npm package build on top of the component scaffold (templates/npm-package/):
   * the separate npm build config.
   * No-op unless {@link npmPackage}.
   */
  async renderNpmPackageTemplates(data: Record<string, unknown> = {}): Promise<void> {
    if (this.npmPackage) {
      await templateDirectory("npm-package", data);
    }
  }
}
