/** Bound the complete auth operation, including setup and response-body consumption. */
export const withAuthOperation = async <T>(
  parent: AbortSignal | undefined,
  run: (signal: AbortSignal) => Promise<T>,
): Promise<T> => {
  const deadline = new AbortController();
  const signal = parent ? AbortSignal.any([parent, deadline.signal]) : deadline.signal;
  signal.throwIfAborted();
  const timer = setTimeout(
    () => deadline.abort(new Error("Authentication timed out after 3 minutes.")),
    3 * 60 * 1000,
  );
  timer.unref();
  let aborted!: () => void;
  const cancellation = new Promise<never>((_resolve, reject) => {
    aborted = () => reject(signal.reason);
    signal.addEventListener("abort", aborted, { once: true });
  });
  try {
    return await Promise.race([run(signal), cancellation]);
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", aborted);
  }
};
