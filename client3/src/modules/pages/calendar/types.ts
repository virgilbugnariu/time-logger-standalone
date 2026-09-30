
export interface WorkedHours {
  hours: string;
  projectId: string;
  detailsId: string;
}

export interface WorkDay {
  id?: string;
  day: number;
  month: number;
  year: number;
  workedHours: WorkedHours[];
}

export interface CalendarWorkedHours {
  // day/month/year
  [key: string]: WorkDay
}

export interface AutofillData {
  workdays: Array<boolean>;
  workedHours: WorkedHours[];
}
