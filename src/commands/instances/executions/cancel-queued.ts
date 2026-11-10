import { Cli, z } from "incur";
import { CancelAllQueuedExecutionsForInstanceDocument as CANCEL_ALL_QUEUED_EXECUTIONS_FOR_INSTANCE } from "../../../graphql/operations/cancelAllQueuedExecutionsForInstance.generated.js";
import { gqlRequest, requireOperationResult } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";

export default Cli.command({
  output: z.object({ instanceId: z.string() }).extend(warningsOutput),
  description:
    "Cancel all queued executions for all Flows of an Instance.\nRunning executions are not canceled. Executions that are queued after the cancellation still run. The cancellation is asynchronous.",
  args: z.object({
    instance: z.string().describe("ID of an instance"),
  }),
  async run(context) {
    const {
      args: { instance },
    } = context;

    const result = await gqlRequest({
      document: CANCEL_ALL_QUEUED_EXECUTIONS_FOR_INSTANCE,
      variables: {
        id: instance,
      },
    });

    const resourceId = requireOperationResult(
      result.cancelAllQueuedExecutionsForInstance?.instance?.id,
      "Queued executions of the instance were not canceled",
    );
    return context.ok(
      { instanceId: resourceId },
      {
        cta: {
          commands: [
            {
              command: "executions list",
              description: "Inspect this instance's executions",
              options: { instance: resourceId },
            },
          ],
        },
      },
    );
  },
});
