import dayjs from "dayjs";
import dayjsTimezonePlugin from "dayjs/plugin/timezone.js";
import dayjsUtcPlugin from "dayjs/plugin/utc.js";

dayjs.extend(dayjsUtcPlugin);
dayjs.extend(dayjsTimezonePlugin);

export const formatTimestamp = (timestamp: string): string =>
  dayjs(timestamp, "YYYY-MM-DDTHH:mm:ss.SSS000+Z", true).format("HH:mm:ss.SSS");

export default dayjs;
