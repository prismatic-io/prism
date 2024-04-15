import axios from "axios";
import { fs } from "../fs.js";
import { gql, gqlRequest } from "../graphql.js";
import mimetypes from "mime-types";
import { basename, extname } from "path";

interface GetPresignedUrlResponse {
  uploadMedia: {
    uploadUrl: string;
    objectUrl: string;
  };
}

/**
 *
 * @param objectId The Prismatic ID of the object to set the avatar for (integration ID, user ID, etc)
 * @param iconPath The path to the icon file
 * @returns The media URL for the file that was uploaded
 */
export const uploadAvatar = async (objectId: string, iconPath: string) => {
  const {
    uploadMedia: { uploadUrl, objectUrl },
  } = await gqlRequest<GetPresignedUrlResponse>({
    document: gql`
      query getPresignedUrl(
        $objectId: ID!
        $fileName: String!
        $mediaType: MediaType!
      ) {
        uploadMedia(
          objectId: $objectId
          fileName: $fileName
          mediaType: $mediaType
        ) {
          uploadUrl
          objectUrl
          error
        }
      }
    `,
    variables: {
      objectId,
      fileName: basename(iconPath),
      mediaType: "AVATAR",
    },
  });

  await axios.put(uploadUrl, await fs.readFile(iconPath), {
    headers: { "Content-Type": mimetypes.contentType(extname(iconPath)) },
  });

  return objectUrl;
};
