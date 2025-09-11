import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Convert local datetime (string/Date) về UTC để lưu DB/Redis
 */
export function toUTC(date: Date | string, timeZone: string = "Asia/Ho_Chi_Minh"): Date {
  return dayjs.tz(date, timeZone).utc().toDate();
}

/**
 * Convert UTC datetime sang local timezone
 */
export function fromUTC(date: Date | string, timeZone: string = "Asia/Ho_Chi_Minh"): Date {
  return dayjs.utc(date).tz(timeZone).toDate();
}

/**
 * Format UTC datetime theo local timezone
 */
export function formatInTimeZone(
  date: Date | string,
  timeZone: string = "Asia/Ho_Chi_Minh",
  pattern: string = "YYYY-MM-DD HH:mm:ss"
): string {
  return dayjs.utc(date).tz(timeZone).format(pattern);
}