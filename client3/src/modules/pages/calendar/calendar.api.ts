import isEmpty from 'lodash/isEmpty';
import { toast } from 'svelte-toastify'
import { records as db } from "../../../db";
import { eifActions } from '../../../store';
import { appInit } from '../../app.init';
import type { WorkDay } from "./types";
import { toKey } from './utils';

export async function apiUpdateWorkDays(workDays: WorkDay[]) {
  const wdToCreate = workDays.filter(wd => !wd.id && !isEmpty(wd.workedHours));
  try {
    for (const wd of wdToCreate) {
      const path = `calendarWorkedHours[${toKey(wd.day, wd.month, wd.year)}]`;
      const created = await db.create('workday_logs', {
        ...wd,
      });
      eifActions.setData(path, created)
    }

    const wdToEdit = workDays.filter(wd => wd.id && !isEmpty(wd.workedHours));
    for (const wd of wdToEdit) {
      const path = `calendarWorkedHours[${toKey(wd.day, wd.month, wd.year)}]`;
      if (wd.id) {
        const updated = await db.update('workday_logs', wd.id, {
          ...wd,
        });
        eifActions.setData(path, updated);
      }
    }

    const wdToDelete = workDays.filter(wd => wd.id && isEmpty(wd.workedHours));
    for (const wd of wdToDelete) {
      const path = `calendarWorkedHours[${toKey(wd.day, wd.month, wd.year)}]`;
      if (wd.id) {
        await db.delete('workday_logs', wd.id);
        eifActions.removeData(path)
      }
    }
  } catch {
    await appInit();
    toast.error('An error has occured 😱');
  }
}

