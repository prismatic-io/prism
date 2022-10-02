import striptags from "striptags";

export const createDescription = (text?: string): string => {
  if (!text) {
    return "";
  }

  const strippedText = striptags(text);
  const [nonEmptyLine] = strippedText.split("\n").filter((t) => t.trim() != "");
  const [fragment] = nonEmptyLine.split(/[.!?]/g);
  return fragment.replace(/`/g, "'");
};
