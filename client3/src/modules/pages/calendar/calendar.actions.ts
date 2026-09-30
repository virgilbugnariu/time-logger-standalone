import { listWorkDays } from "../../../db";
import range from 'lodash/range';
import get from 'lodash/get';
import merge from 'lodash/merge';
import { eifActions } from "../../../store";
import type { AutofillData, WorkDay } from "./types";
import workedHoursSlice from "./workedHours.slice";
import ConfirmationParagraph from '../../common/ConfirmationParagraph.svelte';
import Autofill from './Autofill.svelte';
import NationalDays from '../../nationalDays/NationalDays.svelte';
import { apiUpdateWorkDays } from "./calendar.api";
import { decreaseMonth, getDateFrom, increaseMonth, toKey } from "./utils";
import { loadNationalDays } from "../../nationalDays/nationalDays.api";
import type { FillNationalDaysData } from "../../nationalDays/types";

export async function loadCalendarData(month: number, year: number) {
  try {
    const prevMonth = decreaseMonth(month, year);
    const nextMonth = increaseMonth(month, year);

    const resultList = await listWorkDays<WorkDay>([{ month, year }, prevMonth, nextMonth]);

    if (!resultList) {
      return;
    }

    (resultList || []).forEach((workHourDay) => {
      workedHoursSlice.actions.set(workHourDay)
    });

    await loadNationalDays(year);

  } catch (error) {
    console.log(error);
    console.error("ERROR loading workhour_details");
  }
}

export function fillInNationalDays() {
  const { month, year } = eifActions.getData(state => state.selectedMonth);

  eifActions.pushLayoutBlock({
    title: `National days for ${getDateFrom(1, month, year).format('MMMM YYYY')}`,
    dataPath: 'national-days-for-current-month',
    type: 'modal',
    component: NationalDays,
    actions: [
      { title: 'cancel', action: (block) => eifActions.popLayoutBlock(block.blockId, 'deleteDataAtPath') },
      {
        title: 'add',
        validateBeforeExecute: true,
        action: async (block) => {
          const { nationalDays, workedHours } = eifActions.getDataAtPath<FillNationalDaysData>(block.dataPath);
          const { month, year } = eifActions.getData(state => state.selectedMonth);
          const currentState = eifActions.getData(state => state.calendarWorkedHours);

          const date = getDateFrom(1, month, year);
          const daysInCurrentMonth = date.daysInMonth();
          const modifiedDays: WorkDay[] = [];
          range(1, daysInCurrentMonth).forEach((day: number) => {
            const key = toKey(day, month, year);

            if (nationalDays?.find(dayKey => dayKey === key)) {
              const old = get(currentState, key, {}) as WorkDay;
              modifiedDays.push(
                merge(
                  { day, month, year },
                  old,
                  { workedHours: (old.workedHours || []).concat(workedHours) } as WorkDay
                )
              );
            }
          });

          await apiUpdateWorkDays(modifiedDays);

          eifActions.popLayoutBlock(block.blockId, 'deleteDataAtPath');
        },
      },
    ],
  });
}

export function autofill() {
  eifActions.pushLayoutBlock({
    title: 'Repeater rule for current month',
    dataPath: 'repeater-rule-for-current-month',
    type: 'modal',
    component: Autofill,
    actions: [
      { title: 'cancel', action: (block) => eifActions.popLayoutBlock(block.blockId, 'deleteDataAtPath') },
      {
        title: 'add',
        validateBeforeExecute: true,
        action: async (block) => {
          const { workdays, workedHours } = eifActions.getDataAtPath<AutofillData>(block.dataPath);
          const { month, year } = eifActions.getData(state => state.selectedMonth);
          const currentState = eifActions.getData(state => state.calendarWorkedHours);

          const date = getDateFrom(1, month, year);
          const daysInCurrentMonth = date.daysInMonth();
          const modifiedDays: WorkDay[] = [];
          range(1, daysInCurrentMonth + 1).forEach((day: number) => {
            const current = getDateFrom(day, month, year);
            const dayOfWeek = current.get('d') || 7;

            if (workdays[dayOfWeek]) {
              const key = toKey(day, month, year);
              const old = get(currentState, key, {}) as WorkDay;
              modifiedDays.push(
                merge(
                  { day, month, year },
                  old,
                  { workedHours: (old.workedHours || []).concat(workedHours) } as WorkDay
                )
              );
            }
          });

          await apiUpdateWorkDays(modifiedDays);

          eifActions.popLayoutBlock(block.blockId, 'deleteDataAtPath');
        },
      },
    ],
  });
}

export function clearAll() {
  const { month, year } = eifActions.getData(state => state.selectedMonth);


  eifActions.pushLayoutBlock({
    title: 'Clear work hours for current month',
    type: 'modal',
    dataPath: '',
    component: ConfirmationParagraph,
    extraProps: { text: 'Are you sure you want to clear all worked hours for current month?' },
    actions: [
      { title: 'no', action: (block) => eifActions.popLayoutBlock(block.blockId) },
      {
        title: 'yes', action: async (block) => {
          const data = eifActions.getData(state => state.calendarWorkedHours);

          if (data) {
            const emptiedWorkDays = Object.values(data)
              .filter(wd => wd.year == year && wd.month === month && wd.id)
              .map(wd => ({ ...wd, workedHours: [] }));

            try {
              await apiUpdateWorkDays(emptiedWorkDays);
            } catch {
              // TODO(bogdan): show toast message or something
            }
          }
          eifActions.popLayoutBlock(block.blockId);
        }
      },
    ],
  });
}

