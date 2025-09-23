import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);


export function convertStringToLocalDate(dateStr: string, timeStr: string): Date {
    return dayjs.tz(`${dateStr} ${timeStr}`, "YYYY-MM-DD HH:mm", "Asia/Ho_Chi_Minh").toDate();
}

