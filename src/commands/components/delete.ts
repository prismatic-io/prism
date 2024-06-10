import { Command, Args, ux } from "@oclif/core";
import { gqlRequest, gql } from "../../graphql.js";
import { prismaticUrl } from "../../auth.js";

interface Integration {
  id: string;
  name: string;
  components: { nodes: { id: string }[] };
}

interface FoundIntegrations {
  ids: string[];
  names: string[];
}

export default class DeleteCommand extends Command {
  static description = "Delete a Component";
  static args = {
    component: Args.string({
      required: true,
      description: "ID of the component to delete",
    }),
  };

  async run() {
    const {
      args: { component },
    } = await this.parse(DeleteCommand);

    // Check if the component is being used in any integrations
    const {
      integrations: { nodes },
    } = await gqlRequest({
      document: gql`
        query ListIntegrationsWithComponents {
          integrations(
            allVersions: true
          ) {
            nodes {
              id
              name
              components {
                nodes {
                  id
                }
              }
            }
          }
        }
      `,
      variables: {
        id: component,
      },
    });

    const foundIntegrations = nodes.reduce(
      (accumulator: FoundIntegrations, integration: Integration) => {
        const { id: integrationId, name: integrationName, components } = integration;
        const componentIds = components.nodes.map((component) => component.id);
        if (componentIds.includes(component)) {
          accumulator.ids.push(integrationId);
          accumulator.names.push(integrationName);
        }
        return accumulator;
      },
      { ids: [], names: [] },
    );

    if (foundIntegrations.ids.length > 0) {
      console.log(
        "The component is already being used in these integrations. You should delete the component from these integrations first:\n",
      );
      const tableData = foundIntegrations.ids.map((id: string, index: number) => ({
        name: foundIntegrations.names[index],
        url: `${prismaticUrl}designer/${id}`,
      }));

      ux.table(
        tableData,
        {
          name: {
            header: "Integration Name",
          },
          url: {
            header: "Integration URL",
          },
        },
        {},
      );

      return;
    }

    await gqlRequest({
      document: gql`
        mutation deleteComponent($id: ID!) {
          deleteComponent(input: { id: $id }) {
            component {
              id
            }
            errors {
              field
              messages
            }
          }
        }
      `,
      variables: {
        id: component,
      },
    });
  }
}
