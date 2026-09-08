import { GetPresignedUrlDocument as GET_PRESIGNED_URL } from "../graphql/operations/getPresignedUrl.generated.js";
import { MediaType } from "../graphql/schema.generated.js";
import mimetypes from "mime-types";
import { basename, extname } from "path";
import { fs } from "../fs.js";
import { gqlRequest } from "../graphql.js";
import { fetch } from "./http.js";

/**
 *
 * @param objectId The Prismatic ID of the object to set the avatar for (integration ID, user ID, etc)
 * @param iconPath The path to the icon file
 * @returns The media URL for the file that was uploaded
 */
export const uploadAvatar = async (objectId: string, iconPath: string) => {
  const {
    uploadMedia: { uploadUrl, objectUrl },
  } = await gqlRequest({
    document: GET_PRESIGNED_URL,
    variables: {
      objectId,
      fileName: basename(iconPath),
      mediaType: MediaType.Avatar,
    },
  });

  if (!uploadUrl || !objectUrl) throw new Error("Unable to create avatar upload URL");
  await fetch(uploadUrl, {
    method: "PUT",
    body: await fs.readFile(iconPath),
    headers: {
      "Content-Type": mimetypes.contentType(extname(iconPath)) || "application/octet-stream",
    },
  });

  return objectUrl;
};
