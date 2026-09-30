import dayjs from "dayjs";

export function decompose(date: string) {
  const d = dayjs(date, "YYYY-MM-DD");
  return {
    day: d.get('D'),
    month: d.get('M') + 1,
    year: d.get('y'),
  };
}

