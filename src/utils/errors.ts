interface HandleErrorProps {
  message: string;
  err?: unknown;
  throwError?: boolean;
}

export function handleError({ message, err, throwError = true }: HandleErrorProps) {
  console.error(message);

  if (err) {
    console.error(err);
  }

  if (throwError) {
    throw err instanceof Error ? err : new Error(message);
  }
}
