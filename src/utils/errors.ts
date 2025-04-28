interface HandleErrorProps {
  message: string;
  err?: unknown;
  throwError?: boolean;
}

export function handleError({ message, err, throwError = true }: HandleErrorProps) {
  if (throwError) {
    if (err instanceof Error) {
      console.error(message);
      throw err;
    }

    throw new Error(message);
  } else {
    console.error(message);

    if (err) {
      console.error(err);
    }
  }
}
