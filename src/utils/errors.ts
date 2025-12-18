interface HandleErrorProps {
  message: string;
  err?: unknown;
  throwError?: boolean;
}

export function handleError({ message, err }: HandleErrorProps): never {
  if (err instanceof Error) {
    console.error(message);
    throw err;
  }

  throw new Error(message);
}
