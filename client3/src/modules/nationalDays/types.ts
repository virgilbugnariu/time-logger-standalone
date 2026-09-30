import type { WorkedHours } from "../pages/calendar/types";

export interface NationalDayDTO {
  date: string;
  localName: string;
  name: string;
  countryCode: "RO",
  fixed: boolean,
  global: boolean,
  type: "Public"
}

export interface NationalDay {
  year: number;
  month: number;
  day: number;
  formattedDate: string;
  name: string;
  isDuringTheWeekend?: boolean;
  weekDay: string;
}

export interface NationalDayMap {
  [year: string]: NationalDay;
}

export interface FillNationalDaysData {
  workedHours?: WorkedHours[];
  // Array of date keys: ['10/06/2056']
  nationalDays?: Array<string>;
}
