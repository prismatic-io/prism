import open from "open";
import { getPrismaticUrl } from "../../context.js";

export const openIntegration = async (integrationId: string) => {
  const url = new URL(`/designer/${encodeURIComponent(integrationId)}`, await getPrismaticUrl());

  await open(url.href);
};
