import { Command, Args } from "@oclif/core";
import fs from "fs/promises";
import GenerateIntegrationCommand from "./integration.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default class InitializeIntegration extends Command {
  static description = "Generate a Code Native Integration from an existing low-code integration";
  static args = {
    integrationId: Args.string({
      required: true,
      description: "Integration ID",
    }),
  };

  async run() {
    const {
      args: { integrationId },
    } = await this.parse(InitializeIntegration);

    const {
      integration: { name, definition },
    } = await gqlRequest({
      document: gql`
          query getIntegration(
            $integrationId: ID!
          ) {
            integration(
              id: $integrationId
            ) {
                id
                name
                definition
              }
            }`,
      variables: {
        integrationId,
      },
    });

    await fs.mkdir(name);
    process.chdir(name);

    await GenerateIntegrationCommand.invoke(
      {
        name,
        description: "Generated from an existing low-code integration",
      },
      this.config,
    );
  }
}

interface IntegrationDefinition {
  /** The unique name for this Integration. */
  name: string;
  /** Optional description for this Integration. */
  description?: string;
  /** Optional path to icon to use for this Integration. Path should be relative to the built Integration source. */
  iconPath?: string;
  /** Optional category for this Integration. */
  category?: string;
  /** Optional documentation for this Integration. */
  documentation?: string;
  /** Optional version identifier for this Integration. */
  version?: string;
  /** Optional labels for this Integration. */
  labels?: string[];
  /** Optional endpoint type used by Instances of this Integration.
   *  A Preprocess Flow Config must be specified when using anything other than 'Flow Specific'.
   *  @default EndpointType.FlowSpecific. */
  endpointType?: EndpointType;
  /** Optional Preprocess Flow configuration for when the Trigger payload contains the flow routing attributes.
   *  Cannot specify this if a Preprocess Flow is also configured. */
  triggerPreprocessFlowConfig?: PreprocessFlowConfig;
  /** Flows for this Integration. */
  flows: Flow[];
  /** Config Wizard Pages for this Integration. */
  configPages?: ConfigPages;

  componentRegistry?: ComponentRegistry;
}

export type EndpointType = "flow_specific" | "instance_specific" | "shared_instance";

export type PreprocessFlowConfig = {
  /** Name of the field in the data payload returned by the Preprocess Flow to use for a Flow Name. */
  flowNameField: string;
  /** Optional name of the field in the data payload returned by the Preprocess Flow to use for an External Customer Id. */
  externalCustomerIdField?: string;
  /** Optional name of the field in the data payload returned by the Preprocess Flow to use for an External Customer User Id. */
  externalCustomerUserIdField?: string;
};

interface Flow {
  name: string;
}

type ConfigPages = {
  [x: string]: unknown;
};

type ComponentRegistry = {
  [x: string]: unknown;
};
