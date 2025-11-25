/**
 * Get an adaptive polling interval that starts fast and backs off over time.
 * Polls frequently at first for responsiveness, then less often to reduce load.
 *
 * @param startTime - The timestamp when polling started (Date.now())
 * @returns The polling interval in milliseconds
 */
export function getAdaptivePollIntervalMs(startTime: number): number {
  const timeElapsed = Date.now() - startTime;
  switch (true) {
    case timeElapsed < 30000:
      // every 1s for first 30s
      return 1000;
    case timeElapsed < 60000:
      // every 5s for 30s-1min
      return 5000;
    case timeElapsed < 300000:
      // every 30s for 1min-5min
      return 30000;
    default:
      // every 1min for 5min+
      return 60000;
  }
}
