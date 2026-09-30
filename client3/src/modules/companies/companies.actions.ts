import { records as db } from "../../db";
import companiesSlice from "./companies.slice";
import type { Company } from "./types";

export async function loadCompanies() {
  try {
    const records = await db.list('companies') as unknown as Company[];

    (records || []).forEach(companiesSlice.actions.set);

  } catch (error) {
    console.log(error);
    console.error("ERROR loading companies");
  }
}
