import { records as db } from "../../db";
import workedHoursDetailsSlice, { type WorkedHoursDetails } from "./workedHoursDetails.slice";

export async function loadWorkhourDetails() {
  try {
    const workhour_details = await db.list('workhour_details') as unknown as WorkedHoursDetails[] | null;

    if (!workhour_details) {
      return;
    }

    (workhour_details || []).forEach(workedHoursDetailsSlice.actions.set);

  } catch (error) {
    console.log(error);
    console.error("ERROR loading workhour_details");
  }
}
