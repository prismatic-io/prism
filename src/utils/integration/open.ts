import * as path from "path";
import open from "open";
import { prismaticUrl } from "../../auth.js";

export const openIntegration = async (integrationId: string) => {
  const url = new URL(path.join("designer", integrationId), prismaticUrl);

  await open(url.href);
};
