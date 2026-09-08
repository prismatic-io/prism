import { ListLogSeverityLevelsDocument as LIST_LOG_SEVERITY_LEVELS } from "../../../graphql/operations/listLogSeverityLevels.generated.js";
import { defineCommand, optionsSchema } from "../../../command.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  outputPolicy: "agent-only",
  output: z.object({
    items: z.array(
      z.object({
        id: z.number().int().nullable().optional(),
        name: z.string().nullable().optional(),
      }),
    ),
  }),
  description: "List Log Severities for use by Alert Triggers",
  options: optionsSchema(z.object({ ...ux.table.flags() })),
  async run(context) {
    const { options: flags } = context;

    const result: ResultOf<typeof LIST_LOG_SEVERITY_LEVELS> = await gqlRequest({
      document: LIST_LOG_SEVERITY_LEVELS,
    });

    return ux.table(
      result.logSeverityLevels,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {},
      },
      { ...flags },
    );
  },
});
