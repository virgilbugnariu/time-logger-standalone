import { eifActions } from '../../store';
import type { CalendarWorkedHours } from '../pages/calendar/types';
import { fromKey } from '../pages/calendar/utils';
import type { InvoiceFormData, InvoiceProduct } from "./types";

export function getProductTotal(p: InvoiceProduct) {
  return p.pricePerUnit * p.quantity;
}

export function getProductTVA(p: InvoiceProduct) {
  return p.pricePerUnit * p.quantity * 0.19;
}

export function getTotalWithoutTVA(data?: InvoiceFormData) {
  if (!data) {
    return 0;
  }

  const totals = (data.invoiceProducts || []).map(getProductTotal);
  return totals.reduce((sum, index) => sum + index, 0);
}

export function getTotalTVA(data?: InvoiceFormData) {
  if (!data) {
    return 0;
  }

  const totals = (data.invoiceProducts || []).map(getProductTVA);
  return totals.reduce((sum, index) => sum + index, 0);
}

export function getTotal(data?: InvoiceFormData) {
  if (!data) {
    return 0;
  }

  return getTotalTVA(data) + getTotalWithoutTVA(data);
}

export function getWorkedHoursPerProjectPerMonth(state: CalendarWorkedHours = {}, month: number, year: number): Record<string, number> {
  const details = eifActions.getData(state => state.workHoursDetails);

  const projects: Record<string, number> = {};

  Object.keys(state)
    .filter(key => {
      const { month: m, year: y } = fromKey(key);
      return m === month.toString() && y === year.toString();
    })
    .forEach(key => {
      const wkHoursPerDay = state[key];
      wkHoursPerDay
        ?.workedHours
        ?.filter(wk => details[wk.detailsId]?.isThisWork)
        .forEach(wk => {
          projects[wk.projectId] = projects[wk.projectId] || 0;
          projects[wk.projectId] += parseInt(wk.hours, 10);
        });
    });

  return projects;
}
