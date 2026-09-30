import type { CompaniesMap } from "./modules/companies/companies.slice";
import type { CompaniesContractDetailsMap } from "./modules/contractDetails/contractDetails.slice";
import type { NationalDayMap } from "./modules/nationalDays/types";
import type { SelectedMonth } from "./modules/pages/calendar/selectedMonth.slice";
import type { CalendarWorkedHours, WorkDay } from "./modules/pages/calendar/types";
import type { Project } from "./modules/projects/projects.slice";
import type { SignaturesMap } from "./modules/signatures/types";
import type { WorkedHoursDetails } from "./modules/workedHoursDetails/workedHoursDetails.slice";

export interface RootState {
  selectedMonth: SelectedMonth;
  calendarWorkedHours: CalendarWorkedHours;
  projects: Record<string, Project>;
  workHoursDetails: Record<string, WorkedHoursDetails>
  workedHoursCopied: WorkDay | null;
  nationalDays: NationalDayMap | null;
  signatures: SignaturesMap;
  companies: CompaniesMap;
  companiesContractDetails: CompaniesContractDetailsMap;
}
