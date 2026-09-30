import take from "lodash/take";
import drop from "lodash/drop";
import orderBy from "lodash/orderBy";
import type { CalendarWorkedHours } from "../pages/calendar/types";
import { fromKey } from "../pages/calendar/utils";
import { eifActions } from "../../store";

export function getCurrentMonthWk(state: CalendarWorkedHours, month: number, year: number): string[] {
  return orderBy(Object.keys(state),
    (key) => parseInt(fromKey(key).day, 10)
  )
    .filter(key => {
      const { month: m, year: y } = fromKey(key);
      return m === month.toString() && y === year.toString();
    });
}

export function splitIntoChunks<T>(arr: Array<T> = [], [firstSize, restSize]: number[]): Array<Array<T>> {
  if (!arr) {
    return [];
  }

  if (arr.length <= firstSize) {
    return [
      arr
    ];
  }
  const chunks: Array<Array<T>> = [];

  let size = arr.length > restSize ? restSize : firstSize;

  let rest = [...arr];
  while (rest.length > 0) {
    chunks.push(take(rest, size));
    rest = drop(rest, size);

    size = restSize;
  }

  return chunks;
}

export function getTotalWorkedHoursPerMonth(state: CalendarWorkedHours = {}, month: number, year: number, hiddenProjects: Record<string, boolean>): number {
  const details = eifActions.getData(state => state.workHoursDetails) || {}

  let sum = 0;
  Object.keys(state)
    .filter(key => {
      const { day: d, month: m, year: y } = fromKey(key);
      return m === month.toString() && y === year.toString();
    })
    .forEach(key => {
      const wkHoursPerDay = state[key];
      wkHoursPerDay
        ?.workedHours
        ?.filter(wk => details[wk.detailsId]?.isThisWork)
        ?.filter(wk => !hiddenProjects[wk.projectId])
        .forEach(wk => sum += parseInt(wk.hours, 10));
    });

  return sum;
}

export const toDataURL = (url: string) => fetch(url)
  .then(response => response.blob())
  .then(blob => new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  }))
