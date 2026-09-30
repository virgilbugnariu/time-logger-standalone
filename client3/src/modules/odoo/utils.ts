import get from 'lodash/get';
import orderBy from 'lodash/orderBy';
import { eifActions } from "../../store";
import type { CalendarWorkedHours } from "../pages/calendar/types";
import { fromKey, getDateFrom } from '../pages/calendar/utils';

export function odooCsvExport(state: CalendarWorkedHours, month: number, year: number): string {
  const details = eifActions.getData(state => state.workHoursDetails);
  const projects = eifActions.getData(state => state.projects);

  let csv = "date,account_id/id,journal_id/id,name,unit_amount"

  orderBy(Object.keys(state),
    (key) => parseInt(fromKey(key).day, 10)
  )
    .filter(key => {
      const { month: m, year: y } = fromKey(key);
      return m === month.toString() && y === year.toString();
    })
    .forEach(key => {
      const { day, month, year } = fromKey(key);
      const date = getDateFrom(day, month, year);
      const wkHoursPerDay = state[key];

      wkHoursPerDay?.workedHours?.forEach(wk => {
        csv += `\n${date.format('YYYY-MM-DD')},__export__.account_analytic_account_${get(projects, `${wk.projectId}.odooid`, '❌')},hr_timesheet.analytic_journal,${get(details, `${wk.detailsId}.details`, '❌')},${wk.hours}`;
      });
    });


  return csv;
}
