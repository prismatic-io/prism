import * as Types from "../schema.generated.js";

export type GetIntegrationSystemInstanceQueryVariables = Types.Exact<{
  integrationId: Types.Scalars["ID"]["input"];
}>;

export type GetIntegrationSystemInstanceQuery = {
  __typename?: "RootQuery";
  integration?: {
    __typename?: "Integration";
    isCodeNative: boolean;
    systemInstance: {
      __typename?: "Instance";
      id: string;
      configState?: Types.InstanceConfigState | null;
    };
  } | null;
};
