export interface InvoiceProduct {
  description: string;
  um: string;
  quantity: number;
  pricePerUnit: number;
}
export interface InvoiceFormData {
  name: string;
  date: string;
  fromCompanyId: string;
  toCompanyId: string;
  euroToLeu: number;
  
  invoiceProducts?: Array<InvoiceProduct>;
}

export interface InvoceAutofillData {
  euroToLeu: string;
  pricePerDay: string;
  descriptionId: string;
}
