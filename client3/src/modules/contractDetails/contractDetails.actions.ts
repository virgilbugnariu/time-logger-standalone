import { records as db } from "../../db";
import companiesContractDetailsSlice, { type CompaniesContractDetails } from "./contractDetails.slice";

export async function loadCompaniesContractDetails() {
  try {
    const records = await db.list('companies_contract_details') as unknown as CompaniesContractDetails[];

    (records || []).forEach(companiesContractDetailsSlice.actions.set);
  } catch (error) {
    console.log(error);
    console.error("ERROR loading workhour_details");
  }
}
