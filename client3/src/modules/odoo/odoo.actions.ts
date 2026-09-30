import { eifActions } from "../../store";
import { getDateFrom } from "../pages/calendar/utils";
import { saveFile } from "../utils";
import OdooForm from './OdooForm.svelte';
import { odooCsvExport } from "./utils";

export async function openOdooExport () {
  eifActions.pushLayoutBlock({
    type: 'modal',
    title: 'Odoo CSV export',
    dataPath: '',
    component: OdooForm,
    actions: [
      {
        title: 'back',
        action(block) {
          eifActions.popLayoutBlock(block.blockId);
        }
      },
      {
        title: 'download',
        action: ({ blockId }) => {
          eifActions.popLayoutBlock(blockId);
          const { month, year } = eifActions.getData(data => data.selectedMonth);

          const stateToExport = eifActions.getData(state => state.calendarWorkedHours);
          const monthName = getDateFrom(1, month, year).format('MMMM');

          saveFile(`${monthName}-odoo.csv`, odooCsvExport(stateToExport, month, year));
        }
      }
    ],
  });
}
