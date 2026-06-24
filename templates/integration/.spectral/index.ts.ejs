import type { ComponentManifest, ConfigPage, ScopedConfigVar } from "@prismatic-io/spectral";

import type {
  // @ts-ignore
  configPages,
  // @ts-ignore
  componentRegistry,
  // @ts-ignore
  userLevelConfigPages,
  // @ts-ignore
  scopedConfigVars,
} from "../src";

type IsAny<T> = 0 extends 1 & T ? true : false;

type TConfigPages = IsAny<typeof configPages> extends true
  ? { [key: string]: ConfigPage }
  : typeof configPages;

type TUserLevelConfigPages = IsAny<typeof userLevelConfigPages> extends true
  ? { [key: string]: ConfigPage }
  : typeof userLevelConfigPages;

type TComponentRegistry = IsAny<typeof componentRegistry> extends true
  ? { [key: string]: ComponentManifest }
  : typeof componentRegistry;

type TScopedConfigVarMap = IsAny<typeof scopedConfigVars> extends true
  ? { [key: string]: ScopedConfigVar }
  : typeof scopedConfigVars;

declare module "@prismatic-io/spectral" {
  interface IntegrationDefinitionConfigPages extends TConfigPages {}

  interface IntegrationDefinitionUserLevelConfigPages extends TUserLevelConfigPages {}

  interface IntegrationDefinitionComponentRegistry extends TComponentRegistry {}

  interface IntegrationDefinitionScopedConfigVars extends TScopedConfigVarMap {}
}
