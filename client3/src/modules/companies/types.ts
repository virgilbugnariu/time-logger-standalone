  export interface Company {
    id: string;
    name: string;
    nrRegCom: string;
    cui: string;
    sediu: string;
    judet?: string;
    iban: string;
    bankName: string;
    capitalSocial?: string;
    delegat_nume?: string;
    delegat_cnp?: string;
    delegat_ciSerie?: string;
    delegat_ciNr?: string;
    delegat_eliberatDe?: string;
    isReadonly?: boolean;
  }
