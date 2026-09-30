import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export const NOW = {
  day: dayjs().get('D'),
  month: dayjs().get('M') + 1,
  year: dayjs().get('y'),
}

export function toKey(day: number, month: number, year: number) {
  return `${day}/${month}/${year}`;
}

export function fromKey(key: string) {
  const [day, month, year] = key.split('/');
  return { day, month, year };
}

export function getDayOfWeek(date: Dayjs) {
  const dayJSDayOfWeek = date.get('d');
  if (dayJSDayOfWeek === 0) {
    return 7; // Sunday is the 7th day of the week
  }
  return dayJSDayOfWeek;
}

export function getDateFrom(day: number | string, month: number | string, year: number | string) {
  const date = dayjs(`${month}-${day}-${year}`, "M-D-YYYY")
  return date;
}

export function decreaseMonth(month: number, year: number) {
  if (month - 1 < 1) {
    return { month: 12, year: year - 1 };
  }

  return { month: month - 1, year };
}

export function increaseMonth(month: number, year: number) {
  if (month + 1 >= 12) {
    return { month: 1, year: year + 1 };
  }

  return { month: month + 1, year };
}

