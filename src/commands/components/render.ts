import { writeCommandOutput } from "../../command.js";
import { dumpYaml } from "../../utils/serialize.js";

export const renderDocument = (agent: boolean, value: unknown) => {
  if (agent) return;
  writeCommandOutput(dumpYaml(value));
};
