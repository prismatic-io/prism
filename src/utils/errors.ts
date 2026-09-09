interface HandleErrorProps {
  message: string;
  err?: unknown;
}

export function handleError({ message, err }: HandleErrorProps): never {
  if (err instanceof Error) {
    writeCommandOutput(message, "stderr");
    throw err;
  }

  throw new Error(message);
}
import { writeCommandOutput } from "../command.js";
