import { eifActions } from "../store";
import { backupData, restoreData } from "./backup/backup.actions";
import { loadCompanies } from "./companies/companies.actions";
import { loadCompaniesContractDetails } from "./contractDetails/contractDetails.actions";
import { openMailReport } from "./mailReport/mail.actions";
import { openOdooExport } from "./odoo/odoo.actions";
import Calendar from './pages/calendar/Calendar.svelte';
import { loadProjects } from "./projects/projects.actions";
import { loadSignatures } from "./signatures/signatures.actions";
import { loadWorkhourDetails } from "./workedHoursDetails/workedHoursDetails.actions";

export async function appInit() {
  await Promise.allSettled([
    loadProjects(),
    loadWorkhourDetails(),
    loadSignatures(),
    loadCompanies(),
    loadCompaniesContractDetails(),
  ]);

  eifActions.replaceLayoutBlock({
    type: "page",
    title: "Calendar",
    dataPath: "",
    component: Calendar,
    actions: [
      {
        title: 'Mail Report',
        action: openMailReport,
      },
      {
        title: 'Odoo Report',
        action: openOdooExport
      },
      {
        title: 'Backup',
        action: backupData,
      },
      {
        title: 'Restore',
        action: restoreData,
      },
    ],
  }, 'deleteDataAtPath');
}
