import { records as db } from "../../db";
import signaturesSlice from "./signatures.slice";
import type { Signature } from "./types";

export async function loadSignatures() {
  try {
    const records = await db.list('signatures') as unknown as Signature[];

    (records || []).forEach(signaturesSlice.actions.set);

  } catch (error) {
    console.log(error);
    console.error("ERROR loading signatures");
  }
}
