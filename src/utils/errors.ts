interface HandleErrorProps {
  message: string;
  err?: unknown;
}

export function handleError({ message, err }: HandleErrorProps): never {
  if (err instanceof Error) {
    console.error(message);
    throw err;
  }

  throw new Error(message);
}
